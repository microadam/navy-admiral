module.exports = function createSocketServer(serviceLocator) {

  function listen(port) {
    serviceLocator.primus.on('connection', function (spark) {
      serviceLocator.captainEventHandler.handleEvents(spark, serviceLocator.primus)
      serviceLocator.clientRequestHandler.handleRequests(spark)
      serviceLocator.serviceManager.handleRequests(spark)
    })

    serviceLocator.primus.on('disconnection', function (spark) {
      serviceLocator.connectionHandler.removeConnection(spark)
    })

    serviceLocator.server.listen(port)
    serviceLocator.logger.info('admirald listening on port: ' + port)
  }

  return {
    listen: listen
  }

}
