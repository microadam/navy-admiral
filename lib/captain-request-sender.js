var async = require('async')
  , _ = require('lodash')

// TODO: break up this file!!

module.exports = function captainRequestSender(serviceLocator) {

  function getCaptainsOrSendError(appId, environment, errorCallback, callback) {
    serviceLocator
      .connectionHandler
      .getCaptains(appId, environment, function (error, captains) {

      if (error) throw error
      if (!captains || captains.length < 1) {
        var msg = 'ERROR: No captains currently connected for: "' + appId + ' ' + environment + '"'
          , response = { success: false, message: msg }
        return errorCallback(response)
      }
      callback(captains)
    })
  }

  function sendListOrdersRequest(appId, environment, callback) {
    getCaptainsOrSendError(appId, environment, callback, function (captains) {

      function createOrder(captain) {
        return function (callback) {
          var request = { request: 'orderList' }
          captain.writeAndWait(request, function (response) {
            // TODO: error handling here? (i.e a captain returns success: false)
            callback(null, response)
          })
        }
      }

      var orders = []
      captains.forEach(function (captain) {
        orders.push(createOrder(captain))
      })

      async.parallel(orders, function (error, results) {
        var orders = []
          , response = { success: true }

        results.forEach(function (captain) {
          orders = orders.concat(captain.orders)
        })
        orders = _.uniq(orders)

        response.orders = orders
        callback(response)
      })

    })

  }

  function sendExecuteOrderRequest(requestData, appData, clientSpark, callback) {
    getCaptainsOrSendError(requestData.appId, requestData.environment, callback, function (captains) {

      // TODO: Validate order is valid (run sendListOrdersRequest() first?)
      sendOrderStepListRequest(requestData.order, captains, function (steps) {
        async.eachSeries
        ( steps
        , function (step, eachCallback) {
            runSingleStepOnCaptains
            ( step
            , requestData
            , appData
            , captains
            , clientSpark
            , eachCallback
            )
          }
        , function (error) {
            var msg = 'Order "' + requestData.order + '" has been completed by all Captains'
              , response = { success: true }

            if (error) {
              msg = msg + ' with errors'
              response.success = false
            } else {
              serviceLocator.messageBus.emit('orderComplete', requestData, appData)
            }

            serviceLocator.messageEmitter.emitMessage(clientSpark, msg)
            callback(response)
          }
        )
      })

    })
  }

  function determineDelay(stepDelay, clientDelay, isParallel) {
    if (isParallel || stepDelay === undefined) return 0
    if (stepDelay !== undefined && clientDelay !== undefined) return clientDelay
    if (stepDelay !== undefined) return stepDelay
    return 0
  }

  function runSingleStepOnCaptains(step, requestData, appData, captains, clientSpark, callback) {
    var order = requestData.order
      , clientId = requestData.clientId
      , orderArgs = requestData.orderArgs
      , appId = requestData.appId
      , environment = requestData.environment
      , errorOccured = false
      , parallel = true
      , delay = 0
      , command = 'each'
      , clientRequestedDelay = requestData.options ? requestData.options.delay : null

    if (typeof step !== 'string') {
      parallel = step.parallel === undefined ? parallel : step.parallel
      delay = determineDelay(step.delay, clientRequestedDelay, parallel)
      step = step.name
    }

    if (!parallel) {
      command = 'eachSeries'
    }

    var index = 0
    async[command](captains
    , function (captain, eachCallback) {
        setTimeout(function () {
          var request =
            { request: 'orderExecute'
            , order: order
            , orderArgs: orderArgs
            , step: step
            , environment: environment
            , appId: appId
            , appData: appData
            , clientId: clientId
            }

          captain.writeAndWait(request, function (response) {
            var msg = ''
            if (response.success) {
              msg = 'Step "' + step + '" has been completed by ' + captain.captainName
            } else {
              msg = 'Step "' + step + '" has failed on ' + captain.captainName
              errorOccured = true
              serviceLocator.messageEmitter.emitMessage(clientSpark, 'ERROR: ' + response.message)
            }
            serviceLocator.messageEmitter.emitMessage(clientSpark, msg)
            index++
            eachCallback(null, response)
          })
        }, index > 0 ? (delay * 1000) : 0)
      }
    , function () {
        var msg = 'Step "' + step + '" has been completed by all Captains'
        if (errorOccured) {
          msg = msg + ' with errors'
        }
        serviceLocator.messageEmitter.emitMessage(clientSpark, msg)
        callback(errorOccured)
      }
    )
  }

  function sendOrderStepListRequest(orderName, captains, callback) {

    function createOrder(captain) {
      return function (callback) {
        var request = { request: 'orderStepList', order: orderName }
        captain.writeAndWait(request, function (response) {
          // TODO: error handling here? (i.e a captain returns success: false)
          callback(null, response)
        })
      }
    }

    var orders = []
    captains.forEach(function (captain) {
      orders.push(createOrder(captain))
    })

    async.parallel(orders, function (error, results) {
      // TODO how to handle captains with differing steps? is that even valid?
      // empty set of steps is valid - means that the captain does not know what the order is
      // Loop through all steps returned by captain and return first non empty set as the steps to run
      var steps = []
      results.some(function (order) {
        if (order.steps.length) {
          steps = order.steps
          return true
        }
      })

      callback(steps)
    })

  }

  return {
    sendListOrdersRequest: sendListOrdersRequest
  , sendExecuteOrderRequest: sendExecuteOrderRequest
  }
}
