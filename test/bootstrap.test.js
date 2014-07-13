var should = require('should')
  , bootstrap = require('../bootstrap')

describe('bootstrap', function () {

  it('should load all required modules', function () {
    bootstrap(function (serviceLocator) {
      should.exist(serviceLocator.db)
      should.exist(serviceLocator.app)
      should.exist(serviceLocator.logger)
      should.exist(serviceLocator.primus)
      should.exist(serviceLocator.server)
      should.exist(serviceLocator.serviceManager)
      should.exist(serviceLocator.messageBus)
      should.exist(serviceLocator.pluginManager)
      should.exist(serviceLocator.socketServer)
      should.exist(serviceLocator.connectionHandler)
      should.exist(serviceLocator.messageEmitter)
      should.exist(serviceLocator.captainRequestSender)
      should.exist(serviceLocator.clientRequestHandler)
      should.exist(serviceLocator.captainEventHandler)
    })
  })

})
