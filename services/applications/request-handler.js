var async = require('async')

module.exports = function applicationRequestHandler(serviceLocator, clientSpark) {

  clientSpark.on('applicationList', function (requestData, callback) {
    listApplications(callback)
  })

  clientSpark.on('applicationCreate', function (requestData, callback) {
    createApplication(requestData, callback)
  })

  clientSpark.on('applicationEdit', function (requestData, callback) {
    editApplication(requestData, callback)
  })

  clientSpark.on('applicationGet', function (requestData, callback) {
    getApplication(requestData, callback)
  })

  clientSpark.on('applicationDelete', function (requestData, callback) {
    deleteApplication(requestData, callback)
  })

  function listApplications(callback) {
    serviceLocator.applicationService.list(callback)
  }

  function createApplication(config, callback) {
    var data = { config: config, createdDate: new Date(), createdBy: 'NAME HERE' }
    serviceLocator.applicationService.save(config.appId, data, callback)
  }

  function editApplication(config, callback) {
    async.waterfall
    ( [ function (waterCallback) {
          getApplication(config, function (application) {
            waterCallback(null, application)
          })
        }
      , function (application, waterCallback) {
          application.config = config
          serviceLocator.applicationService.save(config.appId, application, waterCallback)
        }
      ]
    , callback
    )
  }

  function getApplication(data, callback) {
    serviceLocator.applicationService.get(data.appId, function (error, application) {
      callback(application)
    })
  }

  function deleteApplication(data, callback) {
    serviceLocator.applicationService.remove(data.appId, callback)
  }

}
