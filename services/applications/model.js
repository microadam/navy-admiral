module.exports = function createApplicationModel(serviceLocator) {

  var applications = serviceLocator.db.sublevel('applications')

  function list(callback) {
    var data = []
    applications.createValueStream()
      .on('data', function (item) {
        data.push(item)
      })
      .on('end', function () {
        callback(data)
      })
  }

  function save(appId, data, callback) {
    applications.put(appId, data, callback)
  }

  function get(appId, callback) {
    applications.get(appId, callback)
  }

  function remove(appId, callback) {
    applications.del(appId, callback)
  }

  return {
    list: list
  , save: save
  , get: get
  , remove: remove
  }
}
