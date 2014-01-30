module.exports = function captainEventHandler(connectionHandler, messageEmitter) {

  function handleCaptainEvents(captainSpark) {

    captainSpark.on('captainRegister', function (data) {
      registerCaptain(data, captainSpark)
    })

    captainSpark.on('captainOrderMessage', function (data) {
      sendCaptainOrderMessage(data)
    })

  }

  function registerCaptain(data, captainSpark) {
    connectionHandler.addCaptain(data.appId, data.captainName, captainSpark, function (error, captains) {
      messageEmitter.emitMessage(captainSpark, 'Registered as a captain for "' + data.appId + '"')
      var msg = 'There are now ' + captains.length + ' captains for "' + data.appId + '"'
      messageEmitter.emitMessage(captainSpark, msg)
    })
  }

  function sendCaptainOrderMessage(data) {
    messageEmitter.emitCaptainMessageToClient(data.clientId, data.captainName, data.message)
  }

  return handleCaptainEvents

}
