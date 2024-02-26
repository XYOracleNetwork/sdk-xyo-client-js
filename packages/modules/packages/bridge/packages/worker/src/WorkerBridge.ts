import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeExposeOptions, BridgeModule, BridgeUnexposeOptions, CacheConfig } from '@xyo-network/bridge-model'
import { PackageManifestPayload } from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  creatableModule,
  ModuleConfig,
  ModuleEventData,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleParams,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { defaultPackageManifest } from './defaultNodeManifest'
import { WorkerBridgeConfig, WorkerBridgeConfigSchema } from './WorkerBridgeConfig'

export type WorkerBridgeParams<TConfig extends AnyConfigSchema<WorkerBridgeConfig> = AnyConfigSchema<WorkerBridgeConfig>> = ModuleParams<
  TConfig,
  {
    worker?: Worker
  }
>

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
export class WorkerBridge<TParams extends WorkerBridgeParams = WorkerBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [WorkerBridgeConfigSchema]

  private _discoverCache?: LRUCache<string, Payload[]>
  private _targetConfigs: Record<string, ModuleConfig> = {}
  private _targetQueries: Record<string, string[]> = {}

  get discoverCache() {
    const config = this.discoverCacheConfig
    this._discoverCache = this._discoverCache ?? new LRUCache<string, Payload[]>({ ttlAutopurge: true, ...config })
    return this._discoverCache
  }

  get discoverCacheConfig(): LRUCache.Options<string, Payload[], unknown> {
    const discoverCacheConfig: CacheConfig | undefined = this.config.discoverCache === true ? {} : this.config.discoverCache
    return { max: 100, ttl: 1000 * 60 * 5, ...discoverCacheConfig }
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

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]> {
    return []
  }

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    _id: ModuleIdentifier,
    _options?: ModuleFilterOptions<T>,
  ): Promise<T | undefined> {
    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject, unicorn/no-useless-undefined
    return await Promise.resolve(undefined)
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]> {
    return []
  }
}
