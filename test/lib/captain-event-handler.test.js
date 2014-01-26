var sinon = require('sinon')
  , createHandleEvents = require('../../lib/captain-event-handler')
  , EventEmitter = require('events').EventEmitter
  , connectionHandler = require('../../lib/connection-handler')()
  , messageEmitter = require('../../lib/message-emitter')()

function Spark() {
  EventEmitter.call(this)
}

Spark.prototype = Object.create(EventEmitter.prototype)

describe('captain-event-handler', function () {

  describe('handleCaptainEvents()', function () {

    it('should listen to the captainRegister event', function () {
      var spark = new Spark()
        , mockConnectionHandler = sinon.mock(connectionHandler)
        , mockMessageEmitter = sinon.mock(messageEmitter)
        , handleEvents = createHandleEvents(connectionHandler, messageEmitter)

      mockConnectionHandler.expects('addCaptain').once()
      mockConnectionHandler.expects('getNumCaptains').once()
      mockMessageEmitter.expects('emitMessage').twice()

      handleEvents(spark)
      spark.emit('captainRegister', {})
      mockConnectionHandler.verify()
      mockMessageEmitter.verify()
    })

    it('should listen to the captainOrderMessage event', function () {
      var spark = new Spark()
        , mockMessageEmitter = sinon.mock(messageEmitter)
        , handleEvents = createHandleEvents(connectionHandler, messageEmitter)

      mockMessageEmitter.expects('emitCaptainMessageToClient').once()

      handleEvents(spark)
      spark.emit('captainOrderMessage', {})
      mockMessageEmitter.verify()
    })

  })

})
