var bootstrap = require('../test-bootstrap')
  , sinon = require('sinon')
  , EventEmitter = require('events').EventEmitter
  , createClientRequestHandler = require('../../lib/client-request-handler')

function Spark() {
  EventEmitter.call(this)
}

Spark.prototype = Object.create(EventEmitter.prototype)

describe('client-request-handler', function () {

  var serviceLocator = null
  beforeEach(function () {
    bootstrap(function (sl) {
      serviceLocator = sl
    })
  })

  describe('handleClientRequests()', function () {

    it('should register a new client', function (done) {
      var spark = new Spark()
        , mockConnectionHandler = sinon.mock(serviceLocator.connectionHandler)
        , clientRequestHandler = createClientRequestHandler(serviceLocator)

      spark.id = 1
      mockConnectionHandler.expects('addClient').once()

      clientRequestHandler.handleRequests(spark)
      spark.emit('register', null, function (response) {
        response.clientId.should.equal(1)
        mockConnectionHandler.verify()
        done()
      })
    })

    it('should send get order list request', function () {
      var spark = new Spark()
        , mockCaptainRequestSender = sinon.mock(serviceLocator.captainRequestSender)
        , clientRequestHandler = createClientRequestHandler(serviceLocator)

      mockCaptainRequestSender.expects('sendListOrdersRequest').once()

      clientRequestHandler.handleRequests(spark)
      spark.emit('orderList', {}, function () {})

      mockCaptainRequestSender.verify()
    })

    it('should send execute order request', function () {
      var spark = new Spark()
        , mockCaptainRequestSender = sinon.mock(serviceLocator.captainRequestSender)
        , clientRequestHandler = createClientRequestHandler(serviceLocator)

      mockCaptainRequestSender.expects('sendExecuteOrderRequest').once()

      clientRequestHandler.handleRequests(spark)
      spark.emit('executeOrder', {}, function () {})
      mockCaptainRequestSender.verify()
    })

  })

})
