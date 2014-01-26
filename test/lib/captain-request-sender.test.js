var sinon = require('sinon')
  , createCaptainRequestSender = require('../../lib/captain-request-sender')
  , createConnectionHandler = require('../../lib/connection-handler')
  , messageEmitter = require('../../lib/message-emitter')()
  , logger = { info: function () {} }

describe('captain-request-sender', function () {

  describe('sendListOrdersRequest()', function () {

    function createSpark() {
      return {
        writeAndWait: function (request, callback) {
          var response = { orders: [ 'orderOne', 'orderTwo' ] }
          callback(response)
        }
      }
    }

    var connectionHandler = false

    beforeEach(function () {
      connectionHandler = createConnectionHandler(logger)
    })

    it('should return a list of captains orders with two captains connected', function (done) {
      connectionHandler.addCaptain('test', 'one', createSpark())
      connectionHandler.addCaptain('test', 'two', createSpark())

      var captainRequestSender =
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
      var captainRequestSender =
        createCaptainRequestSender(connectionHandler, messageEmitter)

      captainRequestSender.sendListOrdersRequest('test', function (response) {
        response.success.should.equal(false)
        response.message.should.equal('ERROR: No captains currently connected for: "test"')
        done()
      })
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

    var connectionHandler = false
      , clientSpark = { send: function (e, d) { console.log('d: ' + d.message) } }

    beforeEach(function () {
      connectionHandler = createConnectionHandler(logger)
    })

    it('should execute an order successfully when all captains return success', function (done) {
      var response = { success: true }
      connectionHandler.addCaptain('testAppId', 'one', createSpark(response))
      connectionHandler.addCaptain('testAppId', 'two', createSpark(response))

      var mockClientSpark = sinon.mock(clientSpark)
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

    function shouldFail(done) {
      var mockClientSpark = sinon.mock(clientSpark)
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
      connectionHandler.addCaptain('testAppId', 'one', createSpark(response))
      connectionHandler.addCaptain('testAppId', 'two', createSpark(response))
      shouldFail(done)
    })

    it('should fail to execute an order when any captain return false', function (done) {
      var response = { success: false, message: 'Error occured' }
      connectionHandler.addCaptain('testAppId', 'one', createSpark({ success: true }))
      connectionHandler.addCaptain('testAppId', 'two', createSpark(response))
      shouldFail(done)
    })

    it('should fail to execute an order when there are no captains', function (done) {
      var mockClientSpark = sinon.mock(clientSpark)
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
