import { io as Client, Socket } from 'socket.io-client'

import { createServer } from '../socketServer'

/**
 * @group module
 * @group bridge
 */

describe('WebsocketBridge', () => {
  let ioServer: { start: () => void; stop: () => void }
  let moduleClientA: Socket
  const port = 3000
  const serverUrl = `http://localhost:${port}`
  const moduleAddressA = 'f4f4fa193a3b785bcf3f9902d031d49f1cf01a11'
  const moduleAddressB = '0d8cf1ea18281a34c166624ff9d4e5a473d05ae5'

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
    moduleClientA = Client(serverUrl, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 0,
      transports: ['websocket'],
    })
    moduleClientA.on('connect', () => {
      done()
    })
  })

  afterEach((done) => {
    if (moduleClientA.connected) {
      moduleClientA.disconnect()
    }
    done()
  })

  test('should communicate between clients in the same room', (done) => {
    const moduleClientB = Client(serverUrl, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 0,
      transports: ['websocket'],
    })
    moduleClientB.on('connect', () => {
      moduleClientB.emit('join room', 'testRoom')
      moduleClientA.emit('send message', { message: 'Hello room testRoom from client1', room: 'testRoom' })
    })
    moduleClientB.on('message', (message) => {
      expect(message).toBe('Hello room testRoom from client1')
      moduleClientB.disconnect()
      done()
    })
    moduleClientA.emit('join room', 'testRoom')
  })
})
