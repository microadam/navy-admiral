var Plugins = require('js-plugins')
  , pluginManager = new Plugins()

module.exports = function createServiceManager(serviceLocator) {

  function load() {
    var options = { data: { serviceLocator: serviceLocator }, multi: true }
    pluginManager.scan()

    pluginManager.connect(null, 'basic', options, function (error, plugins) {
      plugins.forEach(function (plugin) {
        plugin()
      })
    })
  }

  return {
    load: load
  }
}
