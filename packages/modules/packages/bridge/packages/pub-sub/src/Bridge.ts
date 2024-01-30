import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { ArchivistInsertQuerySchema, asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  creatableModule,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload, QueryFields, SchemaFields } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { LRUCache } from 'lru-cache'

import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams = PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [PubSubBridgeConfigSchema]

  static maxPayloadSizeWarning = 256 * 256
  protected _configQueriesArchivist: string = ''
  protected _configQueriesBoundWitnessDiviner: string = ''
  protected _configQueriesBridge: string = ''
  protected _configResponsesArchivist: string = ''
  protected _configResponsesBoundWitnessDiviner: string = ''
  protected _configResponsesBridge: string = ''
  /**
   * A cache of queries that have been issued
   */
  protected queryCache: LRUCache<string, QueryBoundWitness> = new LRUCache<string, QueryBoundWitness>({
    // TODO: Make these configurable via config
    max: 10_000,
    ttl: 1000 * 60,
  })
  private _discoverCache?: LRUCache<string, Payload[]>
  private _rootAddress?: string
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

  protected get queryArchivist() {
    return this._configQueriesArchivist
  }
  protected get queryBoundWitnessDiviner() {
    return this._configQueriesBoundWitnessDiviner
  }

  // protected get queryBridge() {
  //   return this._configQueriesBridge
  // }
  protected get responseArchivist() {
    return this._configResponsesArchivist
  }
  protected get responseBoundWitnessDiviner() {
    return this._configResponsesBoundWitnessDiviner
  }
  // protected get responseBridge() {
  //   return this._configResponsesBridge
  // }

  async connect(): Promise<boolean> {
    const parentConnected = await super.startHandler()
    if (parentConnected) {
      // TODO: Further resolve supporting modules (Archivists, Diviners, etc.)
      const intermediaryModules = [this.queryArchivist, this.queryBoundWitnessDiviner, this.responseArchivist, this.responseBoundWitnessDiviner]
      const resolved = await Promise.all(intermediaryModules.map((address) => this.resolve(address)))
      return this.connected
    } else {
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    await Promise.resolve()
    this.connected = false
    return true
  }

  override getRootAddress(): Promisable<string> {
    if (!this.connected) throw new Error('Not connected')
    throw new Error('Method not implemented.')
  }

  override targetConfig(address: string): ModuleConfig {
    return assertEx(this._targetConfigs[address], () => `targetConfig not set [${address}]`)
  }

  override async targetDiscover(address?: string | undefined, maxDepth?: number | undefined): Promise<Payload[]> {
    if (!this.connected) throw new Error('Not connected')
    //if caching, return cached result if exists
    const cachedResult = this.discoverCache?.get(address ?? 'root ')
    if (cachedResult) {
      return cachedResult
    }
    await this.started('throw')
    const addressToDiscover = address ?? (await this.getRootAddress())
    const queryPayload: ModuleDiscoverQuery = { maxDepth, schema: ModuleDiscoverQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    const discover = assertEx(await this.targetQuery(addressToDiscover, boundQuery[0], boundQuery[1]), () => `Unable to resolve [${address}]`)[1]

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
      () => `Discover did not return a [${ConfigSchema}] payload`,
    ).config

    this._targetConfigs[addressToDiscover] = assertEx(
      discover.find((payload) => payload.schema === targetConfigSchema) as ModuleConfig,
      () => `Discover did not return a [${targetConfigSchema}] payload`,
    )

    //if caching, set entry
    this.discoverCache?.set(address ?? 'root', discover)

    return discover
  }
  override async targetManifest(address: string, maxDepth?: number | undefined): Promise<ModuleManifestPayload> {
    const addressToCall = address ?? (await this.getRootAddress())
    const queryPayload: ModuleManifestQuery = { maxDepth, schema: ModuleManifestQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    const manifest = assertEx(await this.targetQuery(addressToCall, boundQuery[0], boundQuery[1]), () => `Unable to resolve [${address}]`)[1]
    return assertEx(manifest.find(isPayloadOfSchemaType(ModuleManifestPayloadSchema)), 'Did not receive manifest') as ModuleManifestPayload
  }
  override targetQueries(address: string): string[] {
    if (!this.connected) throw new Error('Not connected')
    return assertEx(this._targetQueries[address], () => `targetQueries not set [${address}]`)
  }
  override async targetQuery(
    address: string,
    query: SchemaFields & object & QueryFields & { schema: string },
    payloads?: Payload[] | undefined,
  ): Promise<ModuleQueryResult> {
    if (!this.connected) throw new Error('Not connected')
    await this.started('throw')

    // TODO: How to get source here???  (query.addresses)/use our address for all responses
    const insertQueryBuilder = new QueryBoundWitnessBuilder({ destination: [address] }).witness(this.account)
    await insertQueryBuilder.query({ _destination: address, address, schema: ArchivistInsertQuerySchema })
    if (payloads) await insertQueryBuilder.payloads([query, ...payloads])
    const [insertQuery] = await insertQueryBuilder.build()
    const queryArchivist = asArchivistInstance(await this.resolve(this.queryArchivist))
    if (!queryArchivist) throw new Error(`${moduleName}: Unable to resolve queryArchivist for query`)
    const insertValue = [insertQuery, query]
    // If there was data associated with the query, add it to the insert
    if (payloads) insertValue.push(...payloads)
    const insertResult = await queryArchivist.insert?.(insertValue)
    // TODO: Deeper assertions here (length, hashes?)
    if (!insertResult) throw new Error(`${moduleName}: Unable to issue query to queryArchivist`)
    const context = new Promise<ModuleQueryResult>((resolve, reject) => {
      // TODO: Hook response queue here and subscribe to response event with competing timeout
      reject(`${moduleName}: Timeout waiting for query response`)
    })
    return context
  }

  override targetQueryable(_address: string, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  protected override startHandler(): Promise<boolean> {
    // Validate necessary configuration
    this._configQueriesArchivist = assertEx(
      this.config.queries?.archivist,
      `${moduleName}: Missing entry for query.archivist in module configuration`,
    )
    this._configQueriesBoundWitnessDiviner = assertEx(
      this.config.queries?.boundWitnessDiviner,
      `${moduleName}: Missing entry for query.boundWitnessDiviner in module configuration`,
    )
    // this._configQueriesBridge = assertEx(this.config.queries?.bridge, `${moduleName}: Missing entry for query.bridge in module configuration`)
    this._configResponsesArchivist = assertEx(
      this.config.responses?.archivist,
      `${moduleName}: Missing entry for response.archivist in module configuration`,
    )
    this._configResponsesBoundWitnessDiviner = assertEx(
      this.config.responses?.boundWitnessDiviner,
      `${moduleName}: Missing entry for response.boundWitnessDiviner in module configuration`,
    )
    // this._configResponsesBridge = assertEx(this.config.responses?.bridge, `${moduleName}: Missing entry for response.bridge in module configuration`)
    return Promise.resolve(true)
  }

  protected async zzz_internalHousekeeping(): Promise<void> {
    // TODO:
    // - Enumerate all local modules (or ones that have issued commands)
    // - check for commands to local modules
    // - issue commands against local modules
    // - Check for responses to local modules
    // - Execute event handlers to notify local modules
    await Promise.resolve()
  }
}
