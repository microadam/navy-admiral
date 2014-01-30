var sinon = require('sinon')
  , should = require('should')
  , logger = { info: function () {} }
  , createConnectionHandler = require('../../lib/connection-handler')

describe('connection-handler', function () {

  function createSpark(id) {
    return {
      id: id
    , join: function (a, cb) { cb() }
    , room: function () { return { clients: function (cb) { cb() } } }
    }
  }

  function createPrimus(ids, sparks) {
    return {
      room: function () { return { clients: function (cb) { cb(null, ids) } } }
    , forEach: function (cb) { sparks.forEach(cb) }
    }
  }

  describe('addCaptain()', function () {

    it('should correctly add a captain', function (done) {
      var spark = createSpark(1)
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.addCaptain('test', 'name', spark, function () {
        // As long as this callback is called, we are happy
        done()
      })
    })

  })

  describe('addClient()', function () {

    it('should correctly add a client', function () {
      var spark = { id: 1 }
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.addClient(spark)

      var matchedSpark = connectionHandler.getClient(1)
      matchedSpark.id.should.equal(1)
    })

  })

  describe('getCaptains()', function () {

    it('should correctly get captains when they all exist', function (done) {
      var sparks = [ { id: 0 }, { id: 1 } ]
        , ids = [ 0, 1 ]
        , connectionHandler = createConnectionHandler(logger, createPrimus(ids, sparks))

      connectionHandler.getCaptains('testAppId', function (error, captains) {
        captains.length.should.equal(2)
        done()
      })

    })

    it('should correctly get captains when not all exist', function (done) {
      var sparks = [ { id: 0 }, { id: 1 } ]
        , ids = [ 3, 4 ]
        , connectionHandler = createConnectionHandler(logger, createPrimus(ids, sparks))

      connectionHandler.getCaptains('testAppId', function (error, captains) {
        captains.length.should.equal(0)
        done()
      })

    })

  })

  describe('removeConnection()', function () {

    it('should correctly remove a Client', function () {
      var spark = { id: 1 }
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.addClient(spark)
      connectionHandler.removeConnection(spark)

      var matchedSpark = connectionHandler.getClient(1)
      should.not.exist(matchedSpark)
    })

    it('should correctly remove a Captain', function () {
      var spark = { id: 1 }
        , infoStub = sinon.stub(logger, 'info')
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.removeConnection(spark)
      infoStub.calledOnce.should.equal(true)
    })

  })

})
