import { io as Client, Socket } from 'socket.io-client'

import { createServer } from '../socketServer'

/**
 * @group module
 * @group bridge
 */

describe('WebsocketBridge', () => {
  let ioServer: { start: () => void; stop: () => void }
  let clientSocket: Socket
  const port = 3000
  const serverUrl = `http://localhost:${port}`

  beforeAll((done) => {
    ioServer = createServer(port)
    ioServer.start()
    done()
  })

  afterAll((done) => {
    ioServer.stop()
    done()
  })

  beforeEach((done) => {
    clientSocket = Client(serverUrl, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 0,
      transports: ['websocket'],
    })
    clientSocket.on('connect', () => {
      done()
    })
  })

  afterEach((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect()
    }
    done()
  })

  test('should communicate between clients in the same room', (done) => {
    const clientSocket2 = Client(serverUrl, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 0,
      transports: ['websocket'],
    })

    clientSocket2.on('connect', () => {
      clientSocket2.emit('join room', 'testRoom')
    })

    clientSocket.on('connect', () => {
      clientSocket.emit('join room', 'testRoom')
      clientSocket.emit('send message', { message: 'Hello room testRoom from client1', room: 'testRoom' })
    })

    clientSocket2.on('message', (message) => {
      expect(message).toBe('Hello room testRoom from client1')
      clientSocket2.disconnect()
      done()
    })
  })
})
