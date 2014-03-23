module.exports = function captainEventHandler(serviceLocator) {

  function handleEvents(captainSpark) {

    captainSpark.on('captainRegister', function (data) {
      registerCaptain(data, captainSpark)
    })

    captainSpark.on('captainOrderMessage', function (data) {
      sendCaptainOrderMessage(data)
    })

    captainSpark.on('captainExecuteOrder', function (data, callback) {
      serviceLocator.applicationService.get(data.appId, function (error, appData) {
        var clientSpark = serviceLocator.connectionHandler.getClient(data.clientId)
        serviceLocator.captainRequestSender.sendExecuteOrderRequest(data
        , appData.config
        , clientSpark
        , callback
        )
      })
    })

  }

  function registerCaptain(data, captainSpark) {
    serviceLocator.connectionHandler.addCaptain(
      data.appId
    , data.captainName
    , captainSpark
    , function (error, captains) {
        var msg = 'Registered as a captain for "' + data.appId + '"'
        serviceLocator.messageEmitter.emitMessage(captainSpark, msg)
        msg = 'There are now ' + captains.length + ' captains for "' + data.appId + '"'
        serviceLocator.messageEmitter.emitMessage(captainSpark, msg)
      }
    )
  }

  function sendCaptainOrderMessage(data) {
    serviceLocator.messageEmitter.emitCaptainMessageToClient(
      data.clientId
    , data.captainName
    , data.message
    )
  }

  return {
    handleEvents: handleEvents
  }

}
