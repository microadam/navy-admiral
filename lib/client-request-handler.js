module.exports = function clientRequestHandler(serviceLocator) {

  function handleRequests(clientSpark) {

    clientSpark.on('register', function (requestData, callback) {
      registerClient(clientSpark, callback)
    })

    clientSpark.on('orderList', function (requestData, callback) {
      getOrderList(requestData, callback)
    })

    clientSpark.on('executeOrder', function (requestData, callback) {
      executeOrder(requestData, clientSpark, callback)
    })

  }

  function registerClient(clientSpark, callback) {
    serviceLocator.connectionHandler.addClient(clientSpark)
    var response = { clientId: clientSpark.id }
    callback(response)
  }

  function getOrderList(requestData, callback) {
    serviceLocator
      .captainRequestSender
      .sendListOrdersRequest(requestData.appId, requestData.environment, callback)
  }

  function executeOrder(requestData, clientSpark, callback) {
    var appId = requestData.appId
      // , environment = requestData.environment

    // TODO: make this return environment specific config?
    serviceLocator.applicationService.get(appId, function (error, appData) {
      if (!appData) {
        appData = {}
      }
      serviceLocator.captainRequestSender.sendExecuteOrderRequest(requestData
      , appData.config
      , clientSpark
      , callback
      )
    })
  }

  return {
    handleRequests: handleRequests
  }

}
