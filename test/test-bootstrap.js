var sinon = require('sinon')
  , EventEmitter = require('events').EventEmitter
  , serviceLocator = {}
  , createSocketServer = require('../lib/socket-server')
  , createConnectionHandler = require('../lib/connection-handler')
  , createMessageEmitter = require('../lib/message-emitter')
  , createCaptainRequestSender = require('../lib/captain-request-sender')

module.exports = function testBootstrap(callback) {

  function noop () {}

  function Primus() {
    EventEmitter.call(this)
  }

  Primus.prototype = Object.create(EventEmitter.prototype)
  Primus.prototype.use = noop

  var primus = new Primus()
  serviceLocator.primus = primus
  serviceLocator.logger = { info: noop }
  serviceLocator.server = { listen: noop }
  serviceLocator.captainEventHandler = { handleEvents: sinon.spy() }
  serviceLocator.clientRequestHandler = { handleRequests: sinon.spy() }
  serviceLocator.serviceManager = { handleRequests: sinon.spy() }

  var socketServer = createSocketServer(serviceLocator)
    , connectionHandler = createConnectionHandler(serviceLocator)
    , messageEmitter = createMessageEmitter(serviceLocator)
    , captainRequestSender = createCaptainRequestSender(serviceLocator)

  serviceLocator.socketServer = socketServer
  serviceLocator.connectionHandler = connectionHandler
  serviceLocator.messageEmitter = messageEmitter
  serviceLocator.captainRequestSender = captainRequestSender

  callback(serviceLocator)
}
