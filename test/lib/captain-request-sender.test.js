var sinon = require('sinon')
  , createCaptainRequestSender = require('../../lib/captain-request-sender')
  , createConnectionHandler = require('../../lib/connection-handler')
  , messageEmitter = require('../../lib/message-emitter')()
  , logger = { info: function () {} }

describe('captain-request-sender', function () {

  function createPrimus(ids, sparks, error) {
    if (!ids) ids = []
    if (!sparks) sparks = []
    return {
      room: function () { return { clients: function (cb) { cb(error, ids) } } }
    , forEach: function (cb) { sparks.forEach(cb) }
    }
  }

  describe('sendListOrdersRequest()', function () {

    function createSpark() {
      return {
        writeAndWait: function (request, cb) {
          var response = { orders: [ 'orderOne', 'orderTwo' ] }
          cb(response)
        }
      }
    }

    it('should return a list of captains orders with two captains connected', function (done) {
      var ids = [ 0, 1 ]
        , sparks = [ createSpark(), createSpark() ]
        , connectionHandler = createConnectionHandler(logger, createPrimus(ids, sparks))
        , captainRequestSender =
            createCaptainRequestSender(connectionHandler, messageEmitter)

      captainRequestSender.sendListOrdersRequest('test', function (response) {
        response.success.should.equal(true)
        response.orders.length.should.equal(2)
        response.orders[0].should.equal('orderOne')
        response.orders[1].should.equal('orderTwo')
        done()
      })
    })

    it('should return a non succesful response when there are no connected captains', function (done) {

      var connectionHandler = createConnectionHandler(logger, createPrimus())
        , captainRequestSender =
            createCaptainRequestSender(connectionHandler, messageEmitter)

      captainRequestSender.sendListOrdersRequest('test', function (response) {
        response.success.should.equal(false)
        response.message.should.equal('ERROR: No captains currently connected for: "test"')
        done()
      })
    })

    it('should throw an error when there is an error retrieving captains', function () {
      var error = new Error('error')
        , connectionHandler = createConnectionHandler(logger, createPrimus([], [], error))
        , captainRequestSender =
            createCaptainRequestSender(connectionHandler, messageEmitter)

      captainRequestSender.sendListOrdersRequest.should.throw()
    })

  })

  describe('sendExecuteOrderRequest()', function () {

    function createSpark(orderExecuteResponse) {
      return {
        writeAndWait: function (request, callback) {
          var response = false
          if (request.request === 'orderStepList') {
            response = { steps: [ 'stepOne', 'stepTwo' ] }
          } else if (request.request === 'orderExecute') {
            response = orderExecuteResponse
          }
          callback(response)
        }
      }
    }

    var clientSpark = { send: function (e, d) { console.log('d: ' + d.message) } }

    it('should execute an order successfully when all captains return success', function (done) {
      var response = { success: true }
        , ids = [ 0, 1 ]
        , sparks = [ createSpark(response), createSpark(response) ]
        , connectionHandler = createConnectionHandler(logger, createPrimus(ids, sparks))
        , mockClientSpark = sinon.mock(clientSpark)
        , captainRequestSender =
            createCaptainRequestSender(connectionHandler, messageEmitter)
        , requestData =
            { order: 'orderName'
            , appId: 'testAppId'
            }

      mockClientSpark.expects('send').exactly(7)

      captainRequestSender.sendExecuteOrderRequest
      ( requestData
      , {}
      , clientSpark
      , function (response) {
          response.success.should.equal(true)
          mockClientSpark.verify()
          done()
        }
      )
    })

    function shouldFail(sparks, done) {
      var ids = [ 0, 1 ]
        , connectionHandler = createConnectionHandler(logger, createPrimus(ids, sparks))
        , mockClientSpark = sinon.mock(clientSpark)
        , captainRequestSender =
            createCaptainRequestSender(connectionHandler, messageEmitter)
        , requestData =
            { order: 'orderName'
            , appId: 'testAppId'
            }

      mockClientSpark.expects('send').exactly(4)

      captainRequestSender.sendExecuteOrderRequest
      ( requestData
      , {}
      , clientSpark
      , function (response) {
          response.success.should.equal(false)
          mockClientSpark.verify()
          done()
        }
      )
    }

    it('should fail to execute an order when all captains return false', function (done) {
      var response = { success: false, message: 'Error occured' }
        , sparks = [ createSpark(response), createSpark(response) ]

      shouldFail(sparks, done)
    })

    it('should fail to execute an order when any captain return false', function (done) {
      var sparks =
      [ createSpark({ success: false, message: 'Error occured' })
      , createSpark({ success: true })
      ]
      shouldFail(sparks, done)
    })

    it('should fail to execute an order when there are no captains', function (done) {
      var connectionHandler = createConnectionHandler(logger, createPrimus())
        , mockClientSpark = sinon.mock(clientSpark)
        , captainRequestSender =
            createCaptainRequestSender(connectionHandler, messageEmitter)
        , requestData =
            { order: 'orderName'
            , appId: 'testAppId'
            }

      mockClientSpark.expects('send').never()

      captainRequestSender.sendExecuteOrderRequest
      ( requestData
      , {}
      , clientSpark
      , function (response) {
          response.success.should.equal(false)
          response.message.should.equal('ERROR: No captains currently connected for: "testAppId"')
          mockClientSpark.verify()
          done()
        }
      )
    })

  })

})
