var bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'admirald' })
  , Primus = require('primus')
  , server = require('http').createServer()
  , primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' })
  , Emitter = require('primus-emitter')
  , PrimusResponder = require('primus-responder')
  , Rooms = require('primus-rooms')
  , connectionHandler = require('./connection-handler')(logger, primus)
  , messageEmitter = require('./message-emitter')(connectionHandler)
  , captainRequestSender = require('./captain-request-sender')(connectionHandler, messageEmitter)
  , handleCaptainEvents = require('./captain-event-handler')(connectionHandler, messageEmitter)
  , handleClientRequests = require('./client-request-handler')(connectionHandler, captainRequestSender)

module.exports = function createSocketServer() {

  function listen(port) {
    primus.use('emitter', Emitter)
    primus.use('responder', PrimusResponder)
    primus.use('rooms', Rooms)

    primus.on('connection', function (spark) {

      handleCaptainEvents(spark, primus)

      spark.on('request', function(requestData, callback) {
        switch (requestData.type) {
        case 'client':
          handleClientRequests(spark, requestData, callback)
          break;
        }
      })

    })

    primus.on('disconnection', function (spark) {
      connectionHandler.removeConnection(spark)
    })

    server.listen(port)
    logger.info('admirald listening on port: ' + port)
  }

  return {
    listen: listen
  }

}
