import { createServer as createHttpServer, Server as HttpServer } from 'node:http'

import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { BridgeExposeOptions, BridgeModule } from '@xyo-network/bridge-model'
import {
  AnyConfigSchema, creatableModule, ModuleInstance,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Server, Socket } from 'socket.io'

import { WebsocketClientBridge } from './ClientBridge.ts'
import { WebsocketBridgeConfig } from './Config.ts'
import { WebsocketBridgeParams } from './Params.ts'

export const BridgeCommands = {
  join: 'join',
  query: 'query',
}

const DEFAULT_HOST_PORT = 8080

@creatableModule()
export class WebsocketBridge<
  TParams extends WebsocketBridgeParams<AnyConfigSchema<WebsocketBridgeConfig>> = WebsocketBridgeParams<WebsocketBridgeConfig>,
>
  extends WebsocketClientBridge<TParams>
  implements BridgeModule<TParams> {
  httpServer?: HttpServer
  server?: Server

  get host() {
    return this.config.host
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  override exposedHandler(): Promisable<Address[]> {
    throw new Error('Unsupported')
  }

  override async startHandler() {
    if (this.host) {
      this.startServer()
    }
    await super.startHandler()
  }

  override async stopHandler() {
    if (this.host) {
      await this.stopServer()
    }
    await super.stopHandler()
  }

  private startServer() {
    if (this.httpServer) {
      throw new Error('Http Server already started')
    }
    if (this.server) {
      throw new Error('Socket Server already started')
    }
    const host = assertEx(this.host, () => 'No Host Configured')
    this.httpServer = createHttpServer() as HttpServer
    this.server = new Server(this.httpServer)

    this.server.on('connection', (socket: Socket) => {
      socket.on(BridgeCommands.join, async (address: Address) => {
        await socket.join(address)
        console.log(`User ${socket.id} has connected to module ${address}`)
      })

      socket.on(BridgeCommands.query, ({ address, query }: { address: Address; query: Payload[] }) => {
        socket.to(address).emit('message', query)
      })
    })
    this.httpServer.listen(host.port ?? DEFAULT_HOST_PORT)
  }

  private async stopServer() {
    await this.server?.close()
    this.server = undefined
    this.httpServer?.close()
    this.httpServer = undefined
  }
}
