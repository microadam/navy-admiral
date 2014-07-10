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
    .option('-P, --port [port]', 'Port to listen on [8006]', 8006)
    .option('-u, --username [username]', 'Username for basic auth', 'none')
    .option('-p, --password [password]', 'Password for basic auth', 'none')

  serviceLocator.app.parse(process.argv)
  var port = serviceLocator.app.port
    , username = serviceLocator.app.username
    , password = serviceLocator.app.password

  serviceLocator.socketServer.listen(port, username, password)

})
