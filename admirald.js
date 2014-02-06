#!/usr/bin/env node
var app = require('commander')
  , createSocketServer = require('./lib/socket-server')

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

var socketServer = createSocketServer()
socketServer.listen(app.port)
