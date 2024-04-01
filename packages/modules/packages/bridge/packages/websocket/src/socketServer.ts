import { createServer as createHttpServer } from 'node:http'

import { Server, Socket } from 'socket.io'

export function createServer(port: number) {
  const httpServer = createHttpServer()
  const io = new Server(httpServer)

  io.on('connection', (socket: Socket) => {
    socket.on('join room', async (room: string) => {
      await socket.join(room)
      socket.to(room).emit('message', `User ${socket.id} has joined the room ${room}`)
    })

    socket.on('send message', ({ room, message }: { room: string; message: string }) => {
      socket.to(room).emit('message', message)
    })
  })

  return {
    start: () => httpServer.listen(port),
    stop: () => httpServer.close(),
  }
}
