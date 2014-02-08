#!/usr/bin/env node
var serviceLocator = require('service-locator').createServiceLocator()
  , app = require('commander')
  , createSocketServer = require('./lib/socket-server')
  , levelup = require('level')
  , sublevel = require('level-sublevel')
  , db = sublevel(levelup(process.env.HOME + '/.navy-admiral'))

serviceLocator.register('db', db)

app.unknownOption = function (arg) {
  console.log('')
  console.log('  Unknown option "' + arg + '"')
  app.help()
  process.exit(0)
}

app
  .version(require('./package.json').version)
  .option('-p, --port [port]', 'Port to listen on [8006]', 8006)

app.parse(process.argv)

var socketServer = createSocketServer(serviceLocator)
socketServer.listen(app.port)
