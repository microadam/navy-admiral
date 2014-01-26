var sinon = require('sinon')
  , createClientRequestHandler = require('../../lib/client-request-handler')
  , connectionHandler = require('../../lib/connection-handler')()
  , captainRequestSender = require('../../lib/captain-request-sender')()

describe('client-request-handler', function () {

  describe('handleClientRequests()', function () {

    it('should register a new client', function (done) {
      var spark = { id: 1 }
        , mockConnectionHandler = sinon.mock(connectionHandler)
        , handleClientRequests = createClientRequestHandler(connectionHandler, captainRequestSender)
        , requestData = { request: 'register' }

      mockConnectionHandler.expects('addClient').once()

      handleClientRequests(spark, requestData, function (response) {
        response.clientId.should.equal(1)
        mockConnectionHandler.verify()
        done()
      })
    })

    it('should send get order list request', function () {
      var spark = { id: 1 }
        , mockCaptainRequestSender = sinon.mock(captainRequestSender)
        , handleClientRequests = createClientRequestHandler(connectionHandler, captainRequestSender)
        , requestData = { request: 'orderList' }

      mockCaptainRequestSender.expects('sendListOrdersRequest').once()

      handleClientRequests(spark, requestData)
      mockCaptainRequestSender.verify()
    })

    it('should send execute order request', function () {
      var spark = { id: 1 }
        , mockCaptainRequestSender = sinon.mock(captainRequestSender)
        , handleClientRequests = createClientRequestHandler(connectionHandler, captainRequestSender)
        , requestData = { request: 'executeOrder' }

      mockCaptainRequestSender.expects('sendExecuteOrderRequest').once()

      handleClientRequests(spark, requestData)
      mockCaptainRequestSender.verify()
    })

  })

})
