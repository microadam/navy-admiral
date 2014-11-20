var authParser = require('basic-auth-parser')

module.exports = function createSocketServer(serviceLocator) {

  function listen(port, username, password) {

    serviceLocator.primus.authorize(function (req, done) {
      var auth = null
      try {
        auth = authParser(req.headers['authorization'])
      } catch (e) {
        serviceLocator.logger.warn('Error while attempting to authorize: ' + e.message)
        return done(e)
      }
      if (auth.username === username && auth.password === password) {
        return done()
      }
      serviceLocator.logger.warn('Incorrect Auth details')
      done({ statusCode: 401 })
    })

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
