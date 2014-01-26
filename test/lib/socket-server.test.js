var sinon = require('sinon')
  , rewire = require('rewire')
  , createSocketServer = rewire('../../lib/socket-server')
  , EventEmitter = require('events').EventEmitter
  , connectionHandler = require('../../lib/connection-handler')()

function noop () {}

function Primus() {
  EventEmitter.call(this)
}

Primus.prototype = Object.create(EventEmitter.prototype)
Primus.prototype.use = noop

function Spark() {
  EventEmitter.call(this)
}
Spark.prototype = Object.create(EventEmitter.prototype)

describe('socket-server', function () {

  describe('listen()', function () {

    var primus = null
      , server = null
      , handleCaptainEvents = null
      , handleClientRequests = null
      , socketServer = null

    beforeEach(function () {
      primus = new Primus()
      server = { listen: noop }
      handleCaptainEvents = sinon.spy()
      handleClientRequests = sinon.spy()

      /* jshint camelcase: false */
      createSocketServer.__set__
      ( { primus: primus
        , server: server
        , logger: { info: noop }
        , connectionHandler: connectionHandler
        , handleCaptainEvents: handleCaptainEvents
        , handleClientRequests: handleClientRequests
        }
      )
      socketServer = createSocketServer()
    })

    it('should listen on the provided port', function () {
      var mockServer = sinon.mock(server)
      mockServer.expects('listen').once().withArgs(9000)
      socketServer.listen(9000)
      mockServer.verify()
    })

    it('should handle captain events', function () {
      var spark = new Spark()
      socketServer.listen(9000)
      primus.emit('connection', spark)
      handleCaptainEvents.calledOnce.should.equal(true)
    })

    it('should handle client requests', function () {
      var spark = new Spark()
      socketServer.listen(9000)
      primus.emit('connection', spark)
      spark.emit('request', { type: 'client' })
      handleClientRequests.calledOnce.should.equal(true)
    })

    it('should remove connections from connection handler when they disconnect', function () {
      var spark = new Spark()
        , mockConnectionHandler = sinon.mock(connectionHandler)

      mockConnectionHandler.expects('removeConnection').once()
      socketServer.listen(9000)
      primus.emit('disconnection', spark)
      mockConnectionHandler.verify()
    })

  })

})
