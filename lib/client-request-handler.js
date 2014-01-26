module.exports = function clientRequestHandler(connectionHandler, captainRequestSender) {

  function handleClientRequests(clientSpark, requestData, callback) {

    switch (requestData.request) {

    case 'register':
      registerClient(clientSpark, callback)
      break;

    case 'orderList':
      getOrderList(requestData, callback)
      break;

    case 'executeOrder':
      executeOrder(requestData, clientSpark, callback)
      break;

    }

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
