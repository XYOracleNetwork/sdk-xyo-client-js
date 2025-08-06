import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { forget } from '@xylabs/forget'
import type { Address } from '@xylabs/hex'
import type { Logger } from '@xylabs/logger'
import type { PackageManifestPayload } from '@xyo-network/manifest'
import { ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import type { ModuleFactoryLocatorInstance } from '@xyo-network/module-model'
import type { NodeInstance } from '@xyo-network/node-model'
import { HDWallet } from '@xyo-network/wallet'

import type {
  Message, QueryMessage, QueryResultMessage,
} from '../WorkerBridge.ts'

export type QueryEvent = MessageEvent<QueryMessage>

export interface CreateNodeMessage extends Message<'createNode'> {
  manifest: PackageManifestPayload
}

export type CreateNodeEvent = MessageEvent<CreateNodeMessage>

export interface NodeCreatedMessage extends Message<'nodeCreated'> {
  address: Address
}

export class WorkerNodeHost {
  protected node: NodeInstance
  protected logger?: Logger

  constructor(
    node: NodeInstance,
    logger?: Logger,
  ) {
    this.node = node
    this.logger = logger
  }

  static async create(config: PackageManifestPayload, locator: ModuleFactoryLocatorInstance) {
    const mnemonic = generateMnemonic(wordlist, 256)
    const manifest = new ManifestWrapper(config, await HDWallet.fromPhrase(mnemonic), locator)
    const [node] = await manifest.loadNodes()
    const worker = new this(node)
    worker.attachNode(node)
    return worker
  }

  static start(logger?: Logger) {
    const listener = async (event: MessageEvent) => {
      switch (event.data.type) {
        case 'createNode': {
          const message: CreateNodeMessage = event.data
          const worker = await this.create(message.manifest, new ModuleFactoryLocator())
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
    }

    self.addEventListener('message', (event: MessageEvent) => {
      forget(listener(event))
    })
  }

  private attachNode(node: NodeInstance) {
    const listener = async (event: MessageEvent) => {
      const message = event.data as Message
      switch (message.type) {
        case 'xyoQuery': {
          const message: QueryMessage = event.data
          const {
            address, msgId, query, payloads,
          } = message
          const mod = address ? await node.resolve(address, { direction: 'down' }) : node
          if (mod) {
            const result: QueryResultMessage = {
              address, msgId, result: await mod.query(query, payloads),
            }
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
    }

    self.addEventListener('message', (event: MessageEvent) => {
      forget(listener(event))
    })
  }
}
