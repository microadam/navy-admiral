module.exports = function connectionHandler(logger) {

  var connectedCaptains = {}
    , connectedClients = {}
    , captainIdsToAppId = {}

  function addCaptain(appId, captainName, captainSpark) {
    if (!Array.isArray(connectedCaptains[appId])) {
      connectedCaptains[appId] = []
    }
    var captain = { name: captainName, spark: captainSpark }
    connectedCaptains[appId].push(captain)
    captainIdsToAppId[captainSpark.id] = appId
    logger.info('Captain connected: ' + captainName + ' - ' + captainSpark.id)
  }

  function getCaptains(appId) {
    return connectedCaptains[appId]
  }

  function getNumCaptains(appId) {
    return connectedCaptains[appId].length
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
      logger.info('Captain disconnected: ' + spark.id)
      var appId = captainIdsToAppId[spark.id]
        , captains = connectedCaptains[appId].filter(function (item) {
            return item.spark.id !== spark.id
          })

      connectedCaptains[appId] = captains
      delete captainIdsToAppId[spark.id]
    }
  }

  return {
    addCaptain: addCaptain
  , getCaptains: getCaptains
  , getNumCaptains: getNumCaptains
  , addClient: addClient
  , getClient: getClient
  , removeConnection: removeConnection
  }

}
