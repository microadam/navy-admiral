var sinon = require('sinon')
  , bootstrap = require('../test-bootstrap')
  , createMessageEmitter = require('../../lib/message-emitter')

function createSpark(sendFn) {
  return { send: sendFn }
}

describe('message-emitter', function () {

  var serviceLocator = null
  beforeEach(function () {
    bootstrap(function (sl) {
      serviceLocator = sl
    })
  })

  describe('emitMessage()', function () {

    it('should send correct data', function (done) {
      var messageEmitter = createMessageEmitter(serviceLocator)
        , spark = createSpark(function (event, data) {
            event.should.equal('serverMessage')
            Object.keys(data).length.should.equal(1)
            data.message.should.equal('hello')
            done()
          })

      messageEmitter.emitMessage(spark, 'hello')
    })

  })

  describe('emitCaptainMessageToClient()', function () {

    it('should send correct data when there is a spark', function (done) {
      var messageEmitter = createMessageEmitter(serviceLocator)
        , getClientStub = sinon.stub(serviceLocator.connectionHandler, 'getClient')
        , spark = createSpark(function (event, data) {
            event.should.equal('captainMessage')
            Object.keys(data).length.should.equal(2)
            data.captainName.should.equal('name')
            data.message.should.equal('hello')
            done()
          })

      getClientStub.returns(spark)
      messageEmitter.emitCaptainMessageToClient(1, 'name', 'hello')
    })

    it('should not send data when there is no spark', function () {
      var messageEmitter = createMessageEmitter(serviceLocator)
        , spark = createSpark(function () {})
        , mockedSpark = sinon.mock(spark)

      mockedSpark.expects('send').never()
      messageEmitter.emitCaptainMessageToClient(1, 'name', 'hello')
      mockedSpark.verify()
    })

  })

})
