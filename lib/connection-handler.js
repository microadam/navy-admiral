module.exports = function connectionHandler(serviceLocator) {

  var connectedClients = {}
    , masterCaptainIds = {}
    , masterCaptainKeys = {}

  function addCaptain(appId, environment, captainName, captainSpark, callback) {
    var roomKey = appId + '-' + environment
    captainSpark.join(roomKey, function () {
      captainSpark.captainName = captainName
      serviceLocator.logger.info('Captain connected: ' + captainName + ' - ' + captainSpark.id)
      makeCaptainMaster(captainSpark, roomKey)
      captainSpark.room(roomKey).clients(callback)
    })
  }

  function makeCaptainMaster(captainSpark, roomKey) {
    if (!masterCaptainIds[roomKey]) {
      masterCaptainIds[roomKey] = captainSpark.id
      if (!masterCaptainKeys[captainSpark.id]) {
        masterCaptainKeys[captainSpark.id] = []
      }
      masterCaptainKeys[captainSpark.id].push(roomKey)
      serviceLocator.logger.info(captainSpark.id + ' now master captain for ' + roomKey)
      serviceLocator.messageEmitter.emitMakeCaptainMasterMessage(captainSpark, roomKey)
    }
  }

  function changeMasterCaptain(spark) {
    if (masterCaptainKeys[spark.id]) {
      var roomKeys = masterCaptainKeys[spark.id]
      roomKeys.forEach(function (key) {
        serviceLocator.logger.info('Master Captain disconnected for ' + key)
        delete masterCaptainIds[key]
        spark.room(key).clients(function (error, captains) {
          captains = captains.filter(function (captainId) {
            return captainId !== spark.id
          })
          if (captains[0]) {
            var captainSpark = serviceLocator.primus.spark(captains[0])
            makeCaptainMaster(captainSpark, key)
          }
        })
      })
      delete masterCaptainKeys[spark.id]
    }
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
      changeMasterCaptain(spark)
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
