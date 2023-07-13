import { HDWallet } from '@xyo-network/account'
import { generateMnemonic, wordlists } from '@xyo-network/bip39'
import { Logger } from '@xyo-network/core'
import { ManifestPayload, ManifestWrapper } from '@xyo-network/manifest'
import { NodeModule } from '@xyo-network/node'

import { Message, QueryMessage, QueryResultMessage } from '../WorkerBridge'

export type QueryEvent = MessageEvent<QueryMessage>

export interface CreateNodeMessage extends Message<'createNode'> {
  manifest: ManifestPayload
}

export type CreateNodeEvent = MessageEvent<CreateNodeMessage>

export interface NodeCreatedMessage extends Message<'nodeCreated'> {
  address: string
}

export class WorkerNodeHost {
  constructor(protected node: NodeModule, protected logger?: Logger) {}

  static async create(config: ManifestPayload) {
    const mnemonic = generateMnemonic(wordlists.english, 256)
    const manifest = new ManifestWrapper(config, await HDWallet.fromMnemonic(mnemonic))
    const [node] = await manifest.loadNodes()
    const worker = new this(node)
    worker.attachNode(node)
    return worker
  }

  static start(logger?: Logger) {
    self.addEventListener('message', async (event: MessageEvent) => {
      switch (event.data.type) {
        case 'createNode': {
          const message: CreateNodeMessage = event.data
          const worker = await this.create(message.manifest)
          logger?.log(`createNode: ${worker.node.address}`)
          const response: NodeCreatedMessage = { address: worker.node.address, type: 'nodeCreated' }
          postMessage(response)
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

  private attachNode(node: NodeModule) {
    self.addEventListener('message', async (event: MessageEvent) => {
      const message = event.data as Message
      switch (message.type) {
        case 'xyoQuery': {
          const message: QueryMessage = event.data
          const { address, msgId, query, payloads } = message
          const module = address ? await node.downResolver.resolve(address) : node
          if (module) {
            const result: QueryResultMessage = { address, msgId, result: await module.query(query, payloads) }
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
