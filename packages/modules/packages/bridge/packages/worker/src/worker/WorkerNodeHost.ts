import { HDWallet } from '@xyo-network/account'
import { Logger } from '@xyo-network/logger'
import { ManifestWrapper, PackageManifestPayload } from '@xyo-network/manifest'
import { NodeInstance } from '@xyo-network/node-model'
import { generateMnemonic, wordlists } from 'bip39'

import { Message, QueryMessage, QueryResultMessage } from '../WorkerBridge'

export type QueryEvent = MessageEvent<QueryMessage>

export interface CreateNodeMessage extends Message<'createNode'> {
  manifest: PackageManifestPayload
}

export type CreateNodeEvent = MessageEvent<CreateNodeMessage>

export interface NodeCreatedMessage extends Message<'nodeCreated'> {
  address: string
}

export class WorkerNodeHost {
  constructor(
    protected node: NodeInstance,
    protected logger?: Logger,
  ) {}

  static async create(config: PackageManifestPayload) {
    const mnemonic = generateMnemonic(256, undefined, wordlists.english)
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

  private attachNode(node: NodeInstance) {
    self.addEventListener('message', async (event: MessageEvent) => {
      const message = event.data as Message
      switch (message.type) {
        case 'xyoQuery': {
          const message: QueryMessage = event.data
          const { address, msgId, query, payloads } = message
          const module = address ? await node.resolve(address, { direction: 'down' }) : node
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
