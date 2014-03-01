#!/usr/bin/env node
var bootstrap = require('./bootstrap')

bootstrap(function (serviceLocator) {

  serviceLocator.app.unknownOption = function (arg) {
    console.log('')
    console.log('  Unknown option "' + arg + '"')
    serviceLocator.app.help()
    process.exit(0)
  }

  serviceLocator.app
    .version(require('./package.json').version)
    .option('-p, --port [port]', 'Port to listen on [8006]', 8006)

  serviceLocator.app.parse(process.argv)
  serviceLocator.socketServer.listen(serviceLocator.app.port)

})
