module.exports = function clientRequestHandler(connectionHandler, captainRequestSender) {

  function handleClientRequests(clientSpark) {

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
    connectionHandler.addClient(clientSpark)
    var response = { clientId: clientSpark.id }
    callback(response)
  }

  function getOrderList(requestData, callback) {
    captainRequestSender.sendListOrdersRequest(requestData.appId, callback)
  }

  function executeOrder(requestData, clientSpark, callback) {
    // TODO: get stored application data for given appId
    // <>.getApplicationData(requestData.appId, function (error, appData) {})
    var appData = {}

    captainRequestSender.sendExecuteOrderRequest
    ( requestData
    , appData
    , clientSpark
    , callback
    )
  }

  return handleClientRequests

}
