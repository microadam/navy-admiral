module.exports = function messageEmitter(connectionHandler) {

  function emitMessage(spark, message) {
    var data = { message: message }
    emit(spark, 'serverMessage', data)
  }

  function emitCaptainMessageToClient(clientId, captainName, message) {
    var data = { message: message, captainName: captainName }
      , clientSpark = connectionHandler.getClient(clientId)
    emit(clientSpark, 'captainMessage', data)
  }

  function emit(spark, event, data) {
    if (spark) {
      spark.send(event, data)
    }
  }

  return {
    emitMessage: emitMessage
  , emitCaptainMessageToClient: emitCaptainMessageToClient
  }
}
