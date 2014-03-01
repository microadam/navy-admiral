var serviceLocator = require('service-locator').createServiceLocator()
  , app = require('commander')
  , createSocketServer = require('./lib/socket-server')
  , levelup = require('level')
  , sublevel = require('level-sublevel')
  , db = sublevel(levelup(process.env.HOME + '/.navy-admiral', { valueEncoding: 'json' }))
  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'admirald' })
  , Primus = require('primus')
  , Emitter = require('primus-emitter')
  , PrimusResponder = require('primus-responder')
  , Rooms = require('primus-rooms')
  , server = require('http').createServer()
  , primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' })
  , serviceManager = require('./lib/service-manager')()
  , createConnectionHandler = require('./lib/connection-handler')
  , createMessageEmitter = require('./lib/message-emitter')
  , createCaptainRequestSender = require('./lib/captain-request-sender')
  , createClientRequestHandler = require('./lib/client-request-handler')
  , createCaptainEventHandler = require('./lib/captain-event-handler')

serviceLocator.register('db', db)
serviceLocator.register('app', app)
serviceLocator.register('logger', logger)
serviceLocator.register('primus', primus)
serviceLocator.register('server', server)

module.exports = function bootstrap(callback) {
  primus.use('emitter', Emitter)
  primus.use('responder', PrimusResponder)
  primus.use('rooms', Rooms)

  serviceManager.load(serviceLocator)

  var socketServer = createSocketServer(serviceLocator)
    , connectionHandler = createConnectionHandler(serviceLocator)
    , messageEmitter = createMessageEmitter(serviceLocator)
    , captainRequestSender = createCaptainRequestSender(serviceLocator)
    , clientRequestHandler = createClientRequestHandler(serviceLocator)
    , captainEventHandler = createCaptainEventHandler(serviceLocator)

  serviceLocator.register('serviceManager', serviceManager)
  serviceLocator.register('socketServer', socketServer)
  serviceLocator.register('connectionHandler', connectionHandler)
  serviceLocator.register('messageEmitter', messageEmitter)
  serviceLocator.register('captainRequestSender', captainRequestSender)
  serviceLocator.register('clientRequestHandler', clientRequestHandler)
  serviceLocator.register('captainEventHandler', captainEventHandler)

  callback(serviceLocator)
}