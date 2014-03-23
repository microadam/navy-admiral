var bootstrap = require('../test-bootstrap')
  , EventEmitter = require('events').EventEmitter
  , sinon = require('sinon')
  , createCaptainEventHandler = require('../../lib/captain-event-handler')

function Spark() {
  EventEmitter.call(this)
}

Spark.prototype = Object.create(EventEmitter.prototype)

describe('captain-event-handler', function () {

  describe('handleCaptainEvents()', function () {

    var serviceLocator = null
    beforeEach(function () {
      bootstrap(function (sl) {
        serviceLocator = sl
      })
    })

    it('should listen to the captainRegister event', function () {
      var spark = new Spark()
        , connectionHandlerStub = sinon.stub(serviceLocator.connectionHandler, 'addCaptain')
        , mockMessageEmitter = sinon.mock(serviceLocator.messageEmitter)
        , captainEventHandler = createCaptainEventHandler(serviceLocator)

      connectionHandlerStub.callsArgWith(3, null, [])
      mockMessageEmitter.expects('emitMessage').twice()

      captainEventHandler.handleEvents(spark)
      spark.emit('captainRegister', {})
      mockMessageEmitter.verify()
    })

    it('should listen to the captainOrderMessage event', function () {
      var spark = new Spark()
        , mockMessageEmitter = sinon.mock(serviceLocator.messageEmitter)
        , captainEventHandler = createCaptainEventHandler(serviceLocator)

      mockMessageEmitter.expects('emitCaptainMessageToClient').once()

      captainEventHandler.handleEvents(spark)
      spark.emit('captainOrderMessage', {})
      mockMessageEmitter.verify()
    })

    it('should listen to the captainExecuteOrder event', function () {
      var spark = new Spark()
        , mockCaptainRequestSender = sinon.mock(serviceLocator.captainRequestSender)
        , captainEventHandler = createCaptainEventHandler(serviceLocator)

      mockCaptainRequestSender.expects('sendExecuteOrderRequest').once()

      captainEventHandler.handleEvents(spark)
      spark.emit('captainExecuteOrder', {})
      mockCaptainRequestSender.verify()
    })

  })

})
