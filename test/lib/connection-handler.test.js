var should = require('should')
  , logger = { info: function () {} }
  , createConnectionHandler = require('../../lib/connection-handler')

describe('connection-handler', function () {

  describe('addCaptain()', function () {

    it('should correctly add a captain', function () {
      var spark = { id: 1 }
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.addCaptain('test', 'name', spark)
      var captains = connectionHandler.getCaptains('test')
      captains.length.should.equal(1)
      captains[0].name.should.equal('name')
      captains[0].spark.id.should.equal(1)
    })

  })

  describe('getNumCaptains()', function () {

    it('should correctly return the number of captains', function () {
      var sparkOne = { id: 1 }
        , sparkTwo = { id: 2 }
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.addCaptain('test', 'nameOne', sparkOne)
      connectionHandler.addCaptain('test', 'nameTwo', sparkTwo)

      var numCaptains = connectionHandler.getNumCaptains('test')
      numCaptains.should.equal(2)
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
        , connectionHandler = createConnectionHandler(logger)

      connectionHandler.addCaptain('test', 'name', spark)
      connectionHandler.removeConnection(spark)

      var captains = connectionHandler.getCaptains('test')
      captains.length.should.equal(0)
    })

  })

})
