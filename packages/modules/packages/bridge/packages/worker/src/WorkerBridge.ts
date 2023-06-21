import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { ManifestPayload } from '@xyo-network/manifest'
import {
  AnyConfigSchema,
  Module,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleParams,
  ModuleQueryResult,
  ModuleWrapper,
  QueryBoundWitness,
} from '@xyo-network/module'
import { NodeAttachQuerySchema } from '@xyo-network/node'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import compact from 'lodash/compact'
import { LRUCache } from 'lru-cache'

import { defaultNodeManifest } from './defaultNodeManifest'
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
  address: string
  msgId?: string
  payloads?: Payload[]
  query: QueryBoundWitness
}

export interface QueryResultMessage {
  address: string
  msgId?: string
  result: ModuleQueryResult
}

export class WorkerBridge<
    TParams extends WorkerBridgeParams = WorkerBridgeParams,
    TEventData extends ModuleEventData = ModuleEventData,
    TModule extends Module<ModuleParams, TEventData> = Module<ModuleParams, TEventData>,
  >
  extends AbstractBridge<TParams, TEventData, TModule>
  implements BridgeModule<TParams, TEventData, TModule>
{
  static override configSchema = WorkerBridgeConfigSchema

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

  static async createWorkerNode(manifest: ManifestPayload = defaultNodeManifest as ManifestPayload) {
    const worker = new Worker(new URL('./worker/Worker.ts', import.meta.url))
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

  connect(): Promisable<boolean> {
    return true
  }

  disconnect(): Promisable<boolean> {
    return true
  }

  override async start() {
    if (this._started) return
    await super.start()

    this.downResolver.addResolver(this.targetDownResolver())

    await this.targetDiscover()

    const childAddresses = await this.targetDownResolver().getRemoteAddresses()

    const children = compact(
      await Promise.all(
        childAddresses.map(async (address) => {
          const resolved = await this.targetDownResolver().resolve({ address: [address] })
          return resolved[0]
        }),
      ),
    )

    await Promise.all(children.map(async (child) => await ModuleWrapper.wrap(child).discover()))

    const parentNodes = await this.upResolver.resolve({ query: [[NodeAttachQuerySchema]] })
    //notify parents of child modules
    //TODO: this needs to be thought through. If this the correct direction for data flow and how do we 'un-attach'?
    parentNodes.forEach((node) => children.forEach((child) => node.emit('moduleAttached', { module: child })))
  }

  targetConfig(address: string): ModuleConfig {
    return assertEx(this._targetConfigs[address], `targetConfig not set [${address}]`)
  }

  async targetDiscover(address?: string): Promise<Payload[]> {
    //if caching, return cached result if exists
    const cachedResult = this.discoverCache?.get(address ?? 'root')
    if (cachedResult) {
      return cachedResult
    }
    const addressToDiscover = address ?? ''
    const queryPayload = PayloadWrapper.wrap<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    const boundQuery = await this.bindQuery(queryPayload)
    const discover = assertEx(await this.targetQuery(addressToDiscover, boundQuery[0], boundQuery[1]), `Unable to resolve [${address}]`)[1]
    this._targetQueries[addressToDiscover] = compact(
      discover?.map((payload) => {
        if (payload.schema === QuerySchema) {
          const schemaPayload = payload as QueryPayload
          return schemaPayload.query
        } else {
          return null
        }
      }) ?? [],
    )

    const targetConfigSchema = assertEx(
      discover.find((payload) => payload.schema === ConfigSchema) as ConfigPayload,
      `Discover did not return a [${ConfigSchema}] payload`,
    ).config

    this._targetConfigs[addressToDiscover] = assertEx(
      discover?.find((payload) => payload.schema === targetConfigSchema) as ModuleConfig,
      `Discover did not return a [${targetConfigSchema}] payload`,
    )

    //if caching, set entry
    this.discoverCache?.set(address ?? 'root', discover)
    return discover
  }

  targetQueries(address: string): string[] {
    return assertEx(this._targetQueries[address], `targetQueries not set [${address}]`)
  }

  async targetQuery(address: string, query: QueryBoundWitness, payloads: Payload[] = []): Promise<ModuleQueryResult | undefined> {
    const msgId = await PayloadWrapper.hashAsync(query)
    const mainPromise = new Promise<ModuleQueryResult>((resolve, reject) => {
      try {
        const message: QueryMessage = {
          address,
          msgId,
          payloads,
          query,
          type: 'xyoQuery',
        }

        const receiveFunc = (message: MessageEvent) => {
          if (message.data.msgId === msgId) {
            this.worker.removeEventListener('message', receiveFunc)
            resolve((message.data as QueryResultMessage).result)
          }
        }

        this.worker.addEventListener('message', receiveFunc)
        this.worker.postMessage(message)
      } catch (ex) {
        reject(ex)
      }
    })
    const result = Promise.race([
      mainPromise,
      (async () => {
        await delay(1000)
        return undefined
      })(),
    ])
    if (!result) {
      console.log('targetQuery timing out')
    }
    return result
  }

  targetQueryable(_address: string, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }
}
