import {
  Address, assertEx, Promisable,
} from '@xylabs/sdk-js'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractBridge } from '@xyo-network/bridge-abstract'
import {
  BridgeExposeOptions, BridgeModule, BridgeUnexposeOptions,
} from '@xyo-network/bridge-model'
import { PackageManifestPayload } from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  CacheConfig,
  creatableModule,
  ModuleConfig,
  ModuleInstance,
  ModuleQueryResult,
  QueryableModuleParams,
} from '@xyo-network/module-model'
import { Payload, Schema } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { defaultPackageManifest } from './defaultNodeManifest.ts'
import { WorkerBridgeConfig, WorkerBridgeConfigSchema } from './WorkerBridgeConfig.ts'

export interface WorkerBridgeParams<TConfig extends AnyConfigSchema<WorkerBridgeConfig> = AnyConfigSchema<WorkerBridgeConfig>> extends QueryableModuleParams<
  TConfig
> {
  worker?: Worker
}

export interface Message<T extends string = string> {
  type: T
}

export interface QueryMessage extends Message<'xyoQuery'> {
  address: Address
  msgId?: string
  payloads?: Payload[]
  query: QueryBoundWitness
}

export interface QueryResultMessage {
  address: Address
  msgId?: string
  result: ModuleQueryResult
}

@creatableModule()
export class WorkerBridge<TParams extends WorkerBridgeParams = WorkerBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, WorkerBridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = WorkerBridgeConfigSchema

  private _discoverCache?: LRUCache<string, Payload[]>
  private _targetConfigs: Record<string, ModuleConfig> = {}
  private _targetQueries: Record<string, string[]> = {}

  get discoverCache() {
    const config = this.discoverCacheConfig
    this._discoverCache = this._discoverCache ?? new LRUCache<string, Payload[]>({ ttlAutopurge: true, ...config })
    return this._discoverCache
  }

  get discoverCacheConfig(): LRUCache.Options<string, Payload[], unknown> {
    const discoverCacheConfig: CacheConfig | undefined = {}
    return {
      max: 100, ttl: 1000 * 60 * 5, ...discoverCacheConfig,
    }
  }

  get worker(): Worker {
    return assertEx(this.params.worker)
  }

  static async createWorkerNode(manifest: PackageManifestPayload = defaultPackageManifest as PackageManifestPayload) {
    const worker = new Worker(new URL('worker/Worker.ts', import.meta?.url ?? __filename))
    worker.postMessage({ manifest, type: 'createNode' })

    await new Promise((resolve, reject) => {
      const eventFunc = (event: MessageEvent) => {
        const timeout = setTimeout(() => {
          console.log('Node creation timeout')
          worker.removeEventListener('message', eventFunc)
          reject('Timeout')
        }, 1000)
        switch (event.data.type) {
          case 'nodeCreated': {
            clearTimeout(timeout)
            worker.removeEventListener('message', eventFunc)
            resolve(true)
            break
          }
          default: {
            const message: Message = event.data
            console.log(`Unknown Event (nodeCreated listener) [${JSON.stringify(event)}]: ${JSON.stringify(message, null, 2)}`)
            break
          }
        }
      }
      worker.addEventListener('message', eventFunc)
    })

    const bridge = await WorkerBridge.create({ config: { schema: WorkerBridgeConfigSchema }, worker })
    await bridge.start()
    return bridge
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]> {
    return []
  }

  override exposedHandler(): Promisable<Address[]> {
    return []
  }

  override getRoots(_force?: boolean | undefined): Promise<ModuleInstance[]> {
    return Promise.resolve([])
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]> {
    return []
  }
}
