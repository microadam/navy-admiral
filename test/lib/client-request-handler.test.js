var sinon = require('sinon')
  , EventEmitter = require('events').EventEmitter
  , createClientRequestHandler = require('../../lib/client-request-handler')
  , connectionHandler = require('../../lib/connection-handler')()
  , captainRequestSender = require('../../lib/captain-request-sender')()

function Spark() {
  EventEmitter.call(this)
}

Spark.prototype = Object.create(EventEmitter.prototype)

describe('client-request-handler', function () {

  describe('handleClientRequests()', function () {

    it('should register a new client', function (done) {
      var spark = new Spark()
        , mockConnectionHandler = sinon.mock(connectionHandler)
        , handleClientRequests = createClientRequestHandler(connectionHandler, captainRequestSender)

      spark.id = 1
      mockConnectionHandler.expects('addClient').once()

      handleClientRequests(spark)
      spark.emit('register', null, function (response) {
        response.clientId.should.equal(1)
        mockConnectionHandler.verify()
        done()
      })
    })

    it('should send get order list request', function () {
      var spark = new Spark()
        , mockCaptainRequestSender = sinon.mock(captainRequestSender)
        , handleClientRequests = createClientRequestHandler(connectionHandler, captainRequestSender)

      mockCaptainRequestSender.expects('sendListOrdersRequest').once()

      handleClientRequests(spark)
      spark.emit('orderList', {}, function () {})

      mockCaptainRequestSender.verify()
    })

    it('should send execute order request', function () {
      var spark = new Spark()
        , mockCaptainRequestSender = sinon.mock(captainRequestSender)
        , handleClientRequests = createClientRequestHandler(connectionHandler, captainRequestSender)

      mockCaptainRequestSender.expects('sendExecuteOrderRequest').once()

      handleClientRequests(spark)
      spark.emit('executeOrder', {}, function () {})
      mockCaptainRequestSender.verify()
    })

  })

})
