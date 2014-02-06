var async = require('async')
  , _ = require('lodash')

// TODO: break up this file!!

module.exports = function captainRequestSender(connectionHandler, messageEmitter) {

  function getCaptainsOrSendError(appId, errorCallback, callback) {
    connectionHandler.getCaptains(appId, function (error, captains) {
      if (error) throw error
      if (!captains || captains.length < 1) {
        var msg = 'ERROR: No captains currently connected for: "' + appId + '"'
          , response = { success: false, message: msg }
        return errorCallback(response)
      }
      callback(captains)
    })
  }

  function sendListOrdersRequest(appId, callback) {
    getCaptainsOrSendError(appId, callback, function (captains) {

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
    getCaptainsOrSendError(requestData.appId, callback, function (captains) {

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
            }

            messageEmitter.emitMessage(clientSpark, msg)
            callback(response)
          }
        )
      })

    })
  }

  function runSingleStepOnCaptains(step, requestData, appData, captains, clientSpark, callback) {
    var order = requestData.order
      , clientId = requestData.clientId
      , orderArgs = requestData.orderArgs
      , appId = requestData.appId
      , errorOccured = false

    async.each
    ( captains
    , function (captain, eachCallback) {
        var request =
          { request: 'orderExecute'
          , order: order
          , orderArgs: orderArgs
          , step: step
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
          }
          messageEmitter.emitMessage(clientSpark, msg)
          eachCallback(null, response)
        })
      }
    , function () {
        var msg = 'Step "' + step + '" has been completed by all Captains'
        if (errorOccured) {
          msg = msg + ' with errors'
        }
        messageEmitter.emitMessage(clientSpark, msg)
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
      // TODO should we ensure all captains have exact same steps and error if not?
      var steps = results[0].steps
      callback(steps)
    })

  }

  return {
    sendListOrdersRequest: sendListOrdersRequest
  , sendExecuteOrderRequest: sendExecuteOrderRequest
  }
}