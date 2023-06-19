import { Logger } from '@xyo-network/core'
import { ManifestPayload, ManifestWrapper } from '@xyo-network/manifest'
import { NodeModule } from '@xyo-network/node'

import { Message, MessageQueryData, MessageResultData } from '../MessageBridge'

export type QueryEvent = MessageEvent<MessageQueryData>

export interface MessageCreateData extends Message<'createNode'> {
  manifest: ManifestPayload
}

export type CreateEvent = MessageEvent<MessageCreateData>

export interface WebpackWarningsData extends Message<'webpackWarnings'> {
  data: string[]
}

export type WebpackWarningsWorkerEvent = MessageEvent<WebpackWarningsData>

export class BrowserNodeServiceWorker {
  constructor(protected node: NodeModule, protected logger?: Logger) {}

  static async create(config: ManifestPayload) {
    const manifest = new ManifestWrapper(config)
    const [node] = await manifest.loadDapps()
    const worker = new this(node)
    worker.init(node)
    return worker
  }

  static start(logger?: Logger) {
    self.addEventListener('message', async (event: MessageEvent) => {
      switch (event.data.type) {
        case 'createNode': {
          const message: MessageCreateData = event.data
          const worker = await this.create(message.manifest)
          logger?.log(`createNode: ${worker.node.address}`)
          postMessage({ address: worker.node.address, type: 'nodeCreated' })
          break
        }
        default: {
          const message: Message = event.data
          logger?.debug(`Unknown Event (Static) [${JSON.stringify(event)}]: ${JSON.stringify(message, null, 2)}`)
          break
        }
      }
    })
  }

  init(node: NodeModule) {
    console.log('init')
    self.addEventListener('message', async (event: MessageEvent) => {
      const message = event.data as Message
      switch (message.type) {
        case 'xyoQuery': {
          const message: MessageQueryData = event.data
          const { address, msgId, query, payloads } = message
          const module = address ? await node.downResolver.resolveOne(address) : node
          if (module) {
            const result: MessageResultData = { address, msgId, result: await module.query(query, payloads) }
            self.postMessage(result)
          }
          break
        }
        default: {
          const message: Message = event.data
          this.logger?.debug(`Unknown Event [${JSON.stringify(event)}]: ${JSON.stringify(message, null, 2)}`)
          break
        }
      }
    })
  }
}
