import { WebSocketServer, createWebSocketStream } from 'ws'
import { spawn } from 'node:child_process'
import express from 'express'
import { ConsoleFilter } from './console_filter.js'
//import fs from 'fs'

let client_count = 0;

const app = express();
const server = app.listen(1337)
app.use(express.static('./src/frontend'))

//let logStream = fs.createReadStream('log.txt')

const wss = new WebSocketServer({ server })
const z80 = spawn('console', ['-f', '-M', '10.0.0.204', '-p', '3030', 'z80']);

wss.on('connection', (ws) => {
  client_count++;
  console.log('Someone Connected!')
  const client_stream = createWebSocketStream(ws, { encoding: 'utf8' });

  const consoleFilter = new ConsoleFilter()
  client_stream.pipe(consoleFilter).pipe(z80.stdin)
  z80.stdout.pipe(client_stream)

  //client_stream.pip(logStream)

  ws.on('close', () => {
    client_count--;
    client_stream.unpipe(z80.stdin)
    z80.stdout.unpipe(client_stream)
  })

  ws.on('error', (msg) => {
    console.error(msg)
  })
});

app.get('/api/clients', (_req, res) => {
  res.json({
    client_count
  })
});
