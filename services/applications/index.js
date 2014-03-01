var createModel = require('./model')
  , requestHandler = require('./request-handler')

module.exports = function initApplicationService(serviceLocator) {
  var model = createModel(serviceLocator)
  serviceLocator.register('applicationService', model)

  function handleRequests(clientSpark) {
    requestHandler(serviceLocator, clientSpark)
  }

  return {
    handleRequests: handleRequests
  }
}
