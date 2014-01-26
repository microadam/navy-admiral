var sinon = require('sinon')
  , createConnectionHandler = require('../../lib/connection-handler')
  , createMessageEmitter = require('../../lib/message-emitter')

function createSpark(sendFn) {
  return { send: sendFn }
}

describe('message-emitter', function () {

  describe('emitMessage()', function () {

    it('should send correct data', function (done) {
      var connectionHandler = createConnectionHandler()
        , messageEmitter = createMessageEmitter(connectionHandler)
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
      var connectionHandler = createConnectionHandler()
        , messageEmitter = createMessageEmitter(connectionHandler)
        , getClientStub = sinon.stub(connectionHandler, 'getClient')
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
      var connectionHandler = createConnectionHandler()
        , messageEmitter = createMessageEmitter(connectionHandler)
        , spark = createSpark(function () {})
        , mockedSpark = sinon.mock(spark)

      mockedSpark.expects('send').never()
      messageEmitter.emitCaptainMessageToClient(1, 'name', 'hello')
      mockedSpark.verify()
    })

  })

})
