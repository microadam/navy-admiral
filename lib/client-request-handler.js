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
    serviceLocator.captainRequestSender.sendListOrdersRequest(requestData.appId, callback)
  }

  function executeOrder(requestData, clientSpark, callback) {
    serviceLocator.applicationService.get(requestData.appId, function (error, appData) {
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
