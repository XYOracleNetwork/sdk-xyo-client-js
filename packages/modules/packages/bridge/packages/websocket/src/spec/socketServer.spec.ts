import '@xylabs/vitest-extended'

import { io as Client, Socket } from 'socket.io-client'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe, expect, test,
} from 'vitest'

import { BridgeCommands, createServer } from '../socketServer.ts'

/**
 * @group module
 * @group bridge
 */
describe.skip('WebsocketBridge', () => {
  let ioServer: { start: () => void; stop: () => void }
  let moduleClientA: Socket
  const port = 3001
  const serverUrl = `http://localhost:${port}`
  const moduleAddressA = 'f4f4fa193a3b785bcf3f9902d031d49f1cf01a11'
  const moduleAddressB = '0d8cf1ea18281a34c166624ff9d4e5a473d05ae5'

  beforeAll(() => {
    ioServer = createServer(port)
    ioServer.start()
  })

  afterAll(() => {
    ioServer.stop()
  })

  beforeEach(async () => {
    await new Promise((resolve) => {
      moduleClientA = Client(serverUrl, {
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 0,
        transports: ['websocket'],
      })
      moduleClientA.on('connect', () => {
        resolve(1)
      })
    })
  })

  afterEach(() => {
    if (moduleClientA.connected) {
      moduleClientA.disconnect()
    }
  })

  test('should communicate between modules', () => {
    const moduleClientB = Client(serverUrl, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 0,
      transports: ['websocket'],
    })
    const query = `Hello from ${moduleAddressB}`
    moduleClientB.on('connect', () => {
      moduleClientB.emit(BridgeCommands.bridge, moduleAddressA)
      moduleClientA.emit(BridgeCommands.sendMessage, { address: moduleAddressA, query })
    })
    moduleClientB.on('message', (received) => {
      expect(received).toBe(query)
      moduleClientB.disconnect()
    })
    moduleClientA.emit(BridgeCommands.bridge, moduleAddressA)
  })
})
