module.exports = function createServiceManager() {

  var services = []

  function load(serviceLocator) {
    // TODO: make this load other services
    var service = require('../services/applications/index')(serviceLocator)
    services.push(service)
  }

  function handleRequests(spark) {
    services.forEach(function (service) {
      service.handleRequests(spark)
    })
  }

  return {
    load: load
  , handleRequests: handleRequests
  }
}
