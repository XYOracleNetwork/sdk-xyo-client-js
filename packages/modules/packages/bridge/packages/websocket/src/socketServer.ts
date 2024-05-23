import { createServer as createHttpServer } from 'node:http'

import { Address } from '@xylabs/hex'
import { Server, Socket } from 'socket.io'

export const BridgeCommands = {
  bridge: 'bridge',
  sendMessage: 'send message',
}

export const createServer = (port: number) => {
  const httpServer = createHttpServer()
  const io = new Server(httpServer)

  io.on('connection', (socket: Socket) => {
    socket.on(BridgeCommands.bridge, async (address: Address) => {
      await socket.join(address)
      console.log(`User ${socket.id} has connected to module ${address}`)
    })

    socket.on(BridgeCommands.sendMessage, ({ address, query }: { address: Address; query: string }) => {
      socket.to(address).emit('message', query)
    })
  })

  return {
    start: () => httpServer.listen(port),
    stop: () => httpServer.close(),
  }
}
