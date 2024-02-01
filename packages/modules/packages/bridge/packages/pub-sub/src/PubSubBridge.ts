/* eslint-disable max-statements */
/* eslint-disable max-depth */
import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { forget } from '@xylabs/forget'
import { compact } from '@xylabs/lodash'
import { EmptyObject } from '@xylabs/object'
import { rejected } from '@xylabs/promise'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { ArchivistInsertQuerySchema, asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness, isQueryBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  asModule,
  asModuleInstance,
  creatableModule,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { NodeAttachQuerySchema } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, ModuleError, Payload, WithMeta } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { LRUCache } from 'lru-cache'

import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

const moduleName = 'PubSubBridge'

/**
 * Creates an object map of payload hashes to payloads based on the payloads passed in
 * @param objs Any array of payloads
 * @returns A map of hashes to payloads
 */
const toMap = async <T extends EmptyObject>(objs: T[]): Promise<Record<string, T>> => {
  const dataHashes = await Promise.all(
    objs.map(async (obj) => {
      return [await PayloadHasher.hash(obj), obj]
    }),
  )
  const metaHashes = dataHashes.map(([_, p]) => [(p as WithMeta<Payload>)?.$hash, p]).filter(([hash]) => hash)
  return Object.fromEntries([...dataHashes, ...metaHashes])
}

const Pending = 'pending' as const
type Pending = typeof Pending

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
  protected _configRootAddress: string = ''
  protected _discoverCache?: LRUCache<string, Payload[]>
  protected _queryCache?: LRUCache<string, Pending | ModuleQueryResult>
  protected _targetConfigs: Record<string, ModuleConfig> = {}
  protected _targetQueries: Record<string, string[]> = {}

  private _pollId?: string
  // TODO: Hoist to config
  private pollFrequency: number = 1000

  get discoverCache() {
    const config = this.discoverCacheConfig
    this._discoverCache = this._discoverCache ?? new LRUCache<string, Payload[]>({ ttlAutopurge: true, ...config })
    return this._discoverCache
  }

  get discoverCacheConfig(): LRUCache.Options<string, Payload[], unknown> {
    const discoverCacheConfig: CacheConfig | undefined = this.config.discoverCache === true ? {} : this.config.discoverCache
    return { max: 100, ttl: 1000 * 60 * 5, ...discoverCacheConfig }
  }

  get queryCacheConfig(): LRUCache.Options<string, Pending | ModuleQueryResult, unknown> {
    const queryCacheConfig: CacheConfig | undefined = this.config.queryCache === true ? {} : this.config.queryCache
    return { max: 100, ttl: 1000 * 60, ...queryCacheConfig }
  }

  protected get queryArchivist() {
    return this._configQueriesArchivist
  }
  protected get queryBoundWitnessDiviner() {
    return this._configQueriesBoundWitnessDiviner
  }

  /**
   * A cache of queries that have been issued
   */
  protected get queryCache(): LRUCache<string, Pending | ModuleQueryResult> {
    const config = this.queryCacheConfig
    const requiredConfig = { noUpdateTTL: false, ttlAutopurge: true }
    this._queryCache = this._queryCache ?? new LRUCache<string, Pending | ModuleQueryResult>({ ...config, ...requiredConfig })
    return this._queryCache
  }

  protected get responseArchivist() {
    return this._configResponsesArchivist
  }
  protected get responseBoundWitnessDiviner() {
    return this._configResponsesBoundWitnessDiviner
  }
  protected get rootAddress() {
    return this._configRootAddress
  }

  async connect(): Promise<boolean> {
    await super.startHandler()
    this.connected = true
    this.poll()
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
    this.connected = false
    return true
  }

  override getRootAddress(): string {
    return this.rootAddress
  }

  override targetConfig(address: string): ModuleConfig {
    return assertEx(this._targetConfigs[address], () => `targetConfig not set [${address}]`)
  }

  override async targetDiscover(address?: string | undefined, maxDepth?: number | undefined): Promise<Payload[]> {
    await Promise.resolve()
    return []
    // if (!this.connected) throw new Error('Not connected')
    // //if caching, return cached result if exists
    // const cachedResult = this.discoverCache?.get(address ?? 'root ')
    // if (cachedResult) {
    //   return cachedResult
    // }
    // await this.started('throw')
    // const addressToDiscover = address ?? (await this.getRootAddress())
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
    // //if caching, set entry
    // this.discoverCache?.set(address ?? 'root', discover)
    // return discover
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
    const $meta = { ...query?.$meta, destination: [address] }
    // TODO: How to get source here???  (query.addresses)/use our address for all responses
    const routedQuery = { ...query, $meta }
    const queryArchivist = asArchivistInstance(await this.resolve(this.queryArchivist, { direction: 'all' }))
    if (!queryArchivist) throw new Error(`${moduleName}: Unable to resolve queryArchivist for query`)
    // If there was data associated with the query, add it to the insert
    const insertResult = await queryArchivist.insert?.(payloads ? [routedQuery, ...payloads] : [routedQuery])
    // TODO: Deeper assertions here (length, hashes?)
    // TODO: Cleaner than casting
    const sourceQueryHash = (routedQuery as unknown as { $hash: string }).$hash
    this.queryCache.set(sourceQueryHash, Pending)
    if (!insertResult) throw new Error(`${moduleName}: Unable to issue query to queryArchivist`)
    const context = new Promise<ModuleQueryResult>((resolve, reject) => {
      const pollForResponse = async () => {
        // Poll for response until cache key expires
        do {
          await delay(100)
          const status = this.queryCache.get(sourceQueryHash)
          if (status === undefined) break
          if (status !== Pending) {
            resolve(status)
            return
          }
        } while (this.queryCache.get(sourceQueryHash) === Pending)
        this.logger?.error(`${moduleName}: Timeout waiting for query response`)
        // TODO: Should we "resolve" with error in tuple in this case instead? The answer
        // is probably that we should match whatever a local module would do if it were to error
        reject(`${moduleName}: Timeout waiting for query response`)
        return
      }
      forget(pollForResponse())
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
    this._configResponsesArchivist = assertEx(
      this.config.responses?.archivist,
      `${moduleName}: Missing entry for response.archivist in module configuration`,
    )
    this._configResponsesBoundWitnessDiviner = assertEx(
      this.config.responses?.boundWitnessDiviner,
      `${moduleName}: Missing entry for response.boundWitnessDiviner in module configuration`,
    )
    this._configRootAddress = assertEx(this.config.rootAddress, `${moduleName}: Missing entry for rootAddress in module configuration`)
    return Promise.resolve(true)
  }

  /**
   * Background process for checking for inbound commands
   */
  private checkForIncomingCommands = async () => {
    const queryBoundWitnessDiviner = assertEx(
      asDivinerInstance(await this.resolve(this.queryBoundWitnessDiviner)),
      `${moduleName}: Error resolving queryBoundWitnessDiviner`,
    )
    const commandArchivist = assertEx(asArchivistInstance(await this.resolve(this.queryArchivist)), `${moduleName}: Error resolving queryArchivist`)
    const queryResponseArchivist = assertEx(
      asArchivistInstance(await this.resolve(this.responseArchivist)),
      `${moduleName}: Error resolving queryArchivist`,
    )
    // Check for any queries that have been issued and have not been responded to
    const localModules = await this.resolve()
    const localAddresses = localModules.map((module) => module.address)
    // TODO: Do in parallel/batches
    for (const localAddress of localAddresses) {
      try {
        // TODO: Retrieve offset from state store
        const offset = 0
        // TODO: Handle offset and limit
        const limit = 1
        const schema = BoundWitnessDivinerQuerySchema
        const sort = 'asc'
        // Filter for commands to us by destination address
        const divinerQuery = { destination: [localAddress], limit, offset, schema, sort }
        const commands = await queryBoundWitnessDiviner.divine([divinerQuery])
        const localModule = assertEx(await this.resolve(localAddress), `${moduleName}: Error resolving local address: ${localAddress}`)
        for (const command of commands.filter(isQueryBoundWitness)) {
          // Ensure the query is addressed to the destination
          const commandDestination = (command.$meta as { destination?: string[] })?.destination
          if (commandDestination && commandDestination?.includes(localAddress)) {
            // Find the query
            const queryIndex = command.payload_hashes.indexOf(command.query)
            if (queryIndex !== -1) {
              const querySchema = command.payload_schemas[queryIndex]
              // If the destination can process this type of query
              if (localModule.queries.includes(querySchema)) {
                // Get the associated payloads
                const commandPayloads = await commandArchivist.get(command.payload_hashes)
                const commandPayloadsDict = await toMap(commandPayloads)
                // Check that we have all the arguments for the command
                if (!containsAll(Object.keys(commandPayloadsDict), command.payload_hashes)) {
                  this.logger?.info(`${moduleName}: Error processing command ${command} for address ${localAddress}, missing payloads`)
                  continue
                }
                try {
                  // Issue the query against module
                  const response = await localModule.query(command, commandPayloads)
                  // TODO: Deeper assertions here for query
                  const [bw, payloads, errors] = response
                  // TODO: Deeper assertions here for insert
                  const insertResult = await queryResponseArchivist.insert([bw, ...payloads, ...errors])
                } catch (error) {
                  this.logger?.error(`${moduleName}: Error processing command ${command} for address ${localAddress}: ${error}`)
                }
              }
            }
          }
        }
      } catch (error) {
        this.logger?.error(`${moduleName}: Error processing commands for address ${localAddress}: ${error}`)
      }
    }
    // Check for responses to any queries that we have issued
  }

  /**
   * Background process for checking for inbound responses
   */
  private checkForResponses = async () => {
    const queryResponseArchivist = assertEx(
      asArchivistInstance(await this.resolve(this.responseArchivist)),
      `${moduleName}: Error resolving queryArchivist`,
    )
    const responseBoundWitnessDiviner = assertEx(
      asDivinerInstance(await this.resolve(this.responseBoundWitnessDiviner)),
      `${moduleName}: Error resolving responseBoundWitnessDiviner`,
    )
    const pendingCommands = [...this.queryCache.entries()].filter(([_, status]) => status === Pending)
    // TODO: Do in parallel/batches
    for (const [sourceQuery, status] of pendingCommands) {
      if (status === Pending) {
        const divinerQuery = { schema: BoundWitnessDivinerQuerySchema, sourceQuery }
        const result = await responseBoundWitnessDiviner.divine([divinerQuery])
        if (result && result.length > 0) {
          const response = result.find(isBoundWitness)
          if (response && (response?.$meta as unknown as { sourceQuery: string })?.sourceQuery === sourceQuery) {
            // TODO: Get any payloads associated with the response
            const payloads = response.payload_hashes?.length > 0 ? await queryResponseArchivist.get(response.payload_hashes) : []
            const errors: ModuleError[] = []
            this.queryCache.set(sourceQuery, [response, payloads, errors])
          }
        }
      }
    }
  }

  private doBackgroundProcessing = async () => {
    // TODO: We should make it configurable if we want to be inbound, outbound, or both
    // as there is good reason for wanting to limit to just one or the other
    const results = await Promise.allSettled([await this.checkForIncomingCommands(), await this.checkForResponses()])
    for (const failure in results.filter(rejected)) {
      this.logger?.error(`${moduleName}: Error in background processing: ${failure}`)
    }
  }

  /**
   * Runs the background divine process on a loop with a delay
   * specified by the `config.pollFrequency`
   */
  private poll() {
    this._pollId = setTimeoutEx(async () => {
      try {
        await this.doBackgroundProcessing()
      } catch (e) {
        console.log(e)
      } finally {
        if (this._pollId) clearTimeoutEx(this._pollId)
        this._pollId = undefined
        this.poll()
      }
    }, this.pollFrequency)
  }
}
