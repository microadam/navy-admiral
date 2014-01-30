module.exports = function connectionHandler(logger, primus) {

  var connectedClients = {}

  function addCaptain(appId, captainName, captainSpark, callback) {
    captainSpark.join(appId, function () {
      captainSpark.captainName = captainName
      logger.info('Captain connected: ' + captainName + ' - ' + captainSpark.id)
      captainSpark.room(appId).clients(callback)
    })
  }

  function getCaptains(appId, callback) {
    var connectedCaptains = []
    primus.room(appId).clients(function (error, captainIds) {
      if (error) return callback(error)
      primus.forEach(function (captainSpark, id) {
        if (captainIds.indexOf(id) > -1) {
          connectedCaptains.push(captainSpark)
        }
      })
      callback(null, connectedCaptains)
    })
  }

  function addClient(clientSpark) {
    logger.info('Client connected: ' + clientSpark.id)
    connectedClients[clientSpark.id] = clientSpark
  }

  function getClient(clientId) {
    return connectedClients[clientId]
  }

  function removeConnection(spark) {
    if (connectedClients[spark.id]) {
      logger.info('Client disconnected: ' + spark.id)
      delete connectedClients[spark.id]
    } else {
      // If we don't recognise its a client, assume its a captain
      logger.info('Captain disconnected: ' + spark.id)
    }
  }

  return {
    addCaptain: addCaptain
  , getCaptains: getCaptains
  , addClient: addClient
  , getClient: getClient
  , removeConnection: removeConnection
  }

}
