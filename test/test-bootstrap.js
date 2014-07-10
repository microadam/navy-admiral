var sinon = require('sinon')
  , EventEmitter = require('events').EventEmitter
  , serviceLocatorFactory = require('service-locator')
  , createSocketServer = require('../lib/socket-server')
  , createConnectionHandler = require('../lib/connection-handler')
  , createMessageEmitter = require('../lib/message-emitter')
  , createCaptainRequestSender = require('../lib/captain-request-sender')
  , serviceManager = require('../lib/service-manager')()

module.exports = function testBootstrap(callback) {

  function noop () {}

  function Primus() {
    EventEmitter.call(this)
  }

  Primus.prototype = Object.create(EventEmitter.prototype)
  Primus.prototype.use = noop
  Primus.prototype.authorize = noop

  var primus = new Primus()
    , serviceLocator = serviceLocatorFactory.createServiceLocator()
    , mockLevel =
      { set: noop
      , del: noop
      , get: function (key, callback) {
          callback(null, { config: null })
        }
      }

  serviceLocator.primus = primus
  serviceLocator.logger = { info: noop }
  serviceLocator.server = { listen: noop }
  serviceLocator.db = { sublevel: function () { return mockLevel } }
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

  serviceManager.load(serviceLocator)

  callback(serviceLocator)
}
