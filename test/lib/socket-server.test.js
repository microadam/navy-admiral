var sinon = require('sinon')
  , bootstrap = require('../test-bootstrap')
  , EventEmitter = require('events').EventEmitter

function Spark() {
  EventEmitter.call(this)
}
Spark.prototype = Object.create(EventEmitter.prototype)

describe('socket-server', function () {

  describe('listen()', function () {

    var serviceLocator = null
    beforeEach(function () {
      bootstrap(function (sl) {
        serviceLocator = sl
      })
    })

    it('should listen on the provided port', function () {
      var mockServer = sinon.mock(serviceLocator.server)
      mockServer.expects('listen').once().withArgs(9000)
      serviceLocator.socketServer.listen(9000)
      mockServer.verify()
    })

    it('should handle captain events', function () {
      var spark = new Spark()
      serviceLocator.socketServer.listen(9000)
      serviceLocator.primus.emit('connection', spark)
      serviceLocator.captainEventHandler.handleEvents.calledOnce.should.equal(true)
    })

    it('should handle client requests', function () {
      var spark = new Spark()
      serviceLocator.socketServer.listen(9000)
      serviceLocator.primus.emit('connection', spark)
      serviceLocator.clientRequestHandler.handleRequests.calledOnce.should.equal(true)
    })

    it('should handle requests from Service Manager', function () {
      var spark = new Spark()
      serviceLocator.socketServer.listen(9000)
      serviceLocator.primus.emit('connection', spark)
      serviceLocator.serviceManager.handleRequests.calledOnce.should.equal(true)
    })

    it('should remove connections from connection handler when they disconnect', function () {
      var spark = new Spark()
        , mockConnectionHandler = sinon.mock(serviceLocator.connectionHandler)

      mockConnectionHandler.expects('removeConnection').once()
      serviceLocator.socketServer.listen(9000)
      serviceLocator.primus.emit('disconnection', spark)
      mockConnectionHandler.verify()
    })

  })

})
