import { assertEx } from '@xylabs/assert'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  creatableModule,
  ModuleConfig,
  ModuleEventData,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBus } from './AsyncQueryBus'
import { PubSubBridgeConfigSchema } from './Config'
import { AsyncQueryBusParams, PubSubBridgeParams } from './Params'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams = PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [PubSubBridgeConfigSchema]

  protected _configRootAddress: string = ''
  protected _configStateStoreArchivist: string = ''
  protected _configStateStoreBoundWitnessDiviner: string = ''
  protected _discoverCache?: LRUCache<string, Payload[]>
  protected _lastState?: LRUCache<string, number>
  protected _targetConfigs: Record<string, ModuleConfig> = {}
  protected _targetQueries: Record<string, string[]> = {}

  private _bus?: Promise<AsyncQueryBus>
  private _pollId?: string

  get discoverCache() {
    const config = this.discoverCacheConfig
    this._discoverCache = this._discoverCache ?? new LRUCache<string, Payload[]>({ ttlAutopurge: true, ...config })
    return this._discoverCache
  }

  get discoverCacheConfig(): LRUCache.Options<string, Payload[], unknown> {
    const discoverCacheConfig: CacheConfig | undefined = this.config.discoverCache === true ? {} : this.config.discoverCache
    return { max: 100, ttl: 1000 * 60 * 5, ...discoverCacheConfig }
  }

  protected get moduleName() {
    return `${this.config.name ?? moduleName}`
  }

  protected get rootAddress() {
    return this._configRootAddress
  }

  // protected get stateStoreArchivistConfig() {
  //   return this._configStateStoreArchivist
  // }

  // protected get stateStoreBoundWitnessDivinerConfig() {
  //   return this._configStateStoreBoundWitnessDiviner
  // }

  async connect(): Promise<boolean> {
    await super.startHandler()
    this.connected = true
    return true
    // const rootTargetDownResolver = this.targetDownResolver()
    // if (rootTargetDownResolver) {
    //   this.downResolver.addResolver(rootTargetDownResolver)
    //   await this.targetDiscover(this.rootAddress)

    //   const childAddresses = await rootTargetDownResolver.getRemoteAddresses()

    //   const children = compact(
    //     await Promise.all(
    //       childAddresses.map(async (address) => {
    //         const resolved = await rootTargetDownResolver.resolve({ address: [address] })
    //         return resolved[0]
    //       }),
    //     ),
    //   )

    //   // Discover all to load cache
    //   await Promise.all(children.map((child) => assertEx(child.discover())))

    //   const parentNodes = await this.upResolver.resolve({ query: [[NodeAttachQuerySchema]] })
    //   //notify parents of child modules
    //   //TODO: this needs to be thought through. If this the correct direction for data flow and how do we 'un-attach'?
    //   for (const node of parentNodes) for (const child of children) forget(node.emit('moduleAttached', { module: child }))
    //   // console.log(`Started HTTP Bridge in ${Date.now() - start}ms`)
    //   this.connected = true

    //   return true
    // } else {
    //   this.connected = false
    //   return false
    // }
  }

  async disconnect(): Promise<boolean> {
    await Promise.resolve()
    const bus = await this.bus()
    bus.stop()
    this.connected = false
    return true
  }

  override getRootAddress(): string {
    return this.rootAddress
  }

  override targetConfig(address: string): ModuleConfig {
    return assertEx(this._targetConfigs[address], () => `targetConfig not set [${address}]`)
  }

  override async targetDiscover(address?: string | undefined, _maxDepth?: number | undefined): Promise<Payload[]> {
    if (!this.connected) throw new Error('Not connected')
    //if caching, return cached result if exists
    const cachedResult = this.discoverCache?.get(address ?? 'root ')
    if (cachedResult) {
      return cachedResult
    }
    await this.started('throw')
    const addressToDiscover = address ?? (await this.getRootAddress())
    this.logger?.debug(`${this.moduleName}: Begin issuing targetDiscover to: ${addressToDiscover}`)
    // const queryPayload: ModuleDiscoverQuery = { maxDepth, schema: ModuleDiscoverQuerySchema }
    // const boundQuery = await this.bindQuery(queryPayload)
    // const discover = assertEx(await this.targetQuery(addressToDiscover, boundQuery[0], boundQuery[1]), () => `Unable to resolve [${address}]`)[1]
    // this._targetQueries[addressToDiscover] = compact(
    //   discover?.map((payload) => {
    //     if (payload.schema === QuerySchema) {
    //       const schemaPayload = payload as QueryPayload
    //       return schemaPayload.query
    //     } else {
    //       return null
    //     }
    //   }) ?? [],
    // )
    // const targetConfigSchema = assertEx(
    //   discover.find((payload) => payload.schema === ConfigSchema) as ConfigPayload,
    //   () => `Discover did not return a [${ConfigSchema}] payload`,
    // ).config
    // this._targetConfigs[addressToDiscover] = assertEx(
    //   discover.find((payload) => payload.schema === targetConfigSchema) as ModuleConfig,
    //   () => `Discover did not return a [${targetConfigSchema}] payload`,
    // )
    // if caching, set entry
    // this.discoverCache?.set(address ?? 'root', discover)
    // return discover
    return []
  }

  override async targetManifest(address: string, maxDepth?: number | undefined): Promise<ModuleManifestPayload> {
    const addressToCall = address ?? this.getRootAddress()
    const queryPayload: ModuleManifestQuery = { maxDepth, schema: ModuleManifestQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    const manifest = assertEx(await this.targetQuery(addressToCall, boundQuery[0], boundQuery[1]), () => `Unable to resolve [${address}]`)[1]
    return assertEx(manifest.find(isPayloadOfSchemaType(ModuleManifestPayloadSchema)), 'Did not receive manifest') as ModuleManifestPayload
  }

  override targetQueries(address: string): string[] {
    if (!this.connected) throw new Error('Not connected')
    return assertEx(this._targetQueries[address], () => `targetQueries not set [${address}]`)
  }

  override async targetQuery(address: string, query: QueryBoundWitness, payloads?: Payload[] | undefined): Promise<ModuleQueryResult> {
    if (!this.connected) throw new Error('Not connected')
    await this.started('throw')
    const bus = await this.bus()
    return bus.send(address, query, payloads)
  }

  override targetQueryable(_address: string, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  /**
   * Ensures the necessary config entries are present and create bus if needed
   */
  protected async bus() {
    if (!this._bus) {
      this._bus = (async () => {
        const { rootAddress, queries, responses, pollFrequency, individualAddressBatchQueryLimit, queryCache } = this.config

        const params: AsyncQueryBusParams = {
          config: { individualAddressBatchQueryLimit, pollFrequency, queryCache, rootAddress },
          listeningModules: async () => await this.resolve(),
          logger: this.logger,
          queries: {
            archivist: assertEx(
              asArchivistInstance(
                await this.resolve(assertEx(queries?.archivist, `${this.moduleName}: Missing entry for queries.archivist in module configuration`)),
              ),
            ),
            boundWitnessDiviner: assertEx(
              asDivinerInstance(
                await this.resolve(
                  assertEx(queries?.boundWitnessDiviner, `${this.moduleName}: Missing entry for queries.boundWitnessDiviner in module configuration`),
                ),
              ),
            ),
          },
          responses: {
            archivist: assertEx(
              asArchivistInstance(
                await this.resolve(
                  assertEx(responses?.archivist, `${this.moduleName}: Missing entry for responses.archivist in module configuration`),
                ),
              ),
            ),
            boundWitnessDiviner: assertEx(
              asDivinerInstance(
                await this.resolve(
                  assertEx(
                    responses?.boundWitnessDiviner,
                    `${this.moduleName}: Missing entry for responses.boundWitnessDiviner in module configuration`,
                  ),
                ),
              ),
            ),
          },
        }
        const bus = new AsyncQueryBus(params)
        bus.start()
        return bus
      })()
    }
    return await this._bus
  }

  protected override async startHandler(): Promise<boolean> {
    await this.connect()
    return true
  }

  protected override async stopHandler(_timeout?: number | undefined) {
    const bus = await this.bus()
    bus.stop()
    return true
  }
}
