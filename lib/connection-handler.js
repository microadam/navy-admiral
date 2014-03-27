module.exports = function connectionHandler(serviceLocator) {

  var connectedClients = {}

  function addCaptain(appId, environment, captainName, captainSpark, callback) {
    var roomKey = appId + '-' + environment
    captainSpark.join(roomKey, function () {
      captainSpark.captainName = captainName
      serviceLocator.logger.info('Captain connected: ' + captainName + ' - ' + captainSpark.id)
      captainSpark.room(roomKey).clients(callback)
    })
  }

  function getCaptains(appId, environment, callback) {
    var connectedCaptains = []
      , roomKey = appId + '-' + environment

    serviceLocator.primus.room(roomKey).clients(function (error, captainIds) {
      if (error) return callback(error)
      serviceLocator.primus.forEach(function (captainSpark, id) {
        if (captainIds.indexOf(id) > -1) {
          connectedCaptains.push(captainSpark)
        }
      })
      callback(null, connectedCaptains)
    })
  }

  function addClient(clientSpark) {
    serviceLocator.logger.info('Client connected: ' + clientSpark.id)
    connectedClients[clientSpark.id] = clientSpark
  }

  function getClient(clientId) {
    return connectedClients[clientId]
  }

  function removeConnection(spark) {
    if (connectedClients[spark.id]) {
      serviceLocator.logger.info('Client disconnected: ' + spark.id)
      delete connectedClients[spark.id]
    } else {
      // If we don't recognise its a client, assume its a captain
      serviceLocator.logger.info('Captain disconnected: ' + spark.id)
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
