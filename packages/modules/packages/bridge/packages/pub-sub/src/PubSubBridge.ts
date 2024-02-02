/* eslint-disable max-lines */
import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { forget } from '@xylabs/forget'
import { EmptyObject } from '@xylabs/object'
import { rejected } from '@xylabs/promise'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { isBoundWitness, isQueryBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  creatableModule,
  ModuleConfig,
  ModuleEventData,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, isPayloadWithHash, ModuleError, Payload, WithMeta } from '@xyo-network/payload-model'
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

  protected _configQueriesArchivist: string = ''
  protected _configQueriesBoundWitnessDiviner: string = ''
  protected _configQueriesBridge: string = ''
  protected _configResponsesArchivist: string = ''
  protected _configResponsesBoundWitnessDiviner: string = ''
  protected _configResponsesBridge: string = ''
  protected _configRootAddress: string = ''
  protected _configStateStoreArchivist: string = ''
  protected _configStateStoreBoundWitnessDiviner: string = ''
  protected _discoverCache?: LRUCache<string, Payload[]>
  protected _lastState?: LRUCache<string, number>
  protected _queryCache?: LRUCache<string, Pending | ModuleQueryResult>
  protected _targetConfigs: Record<string, ModuleConfig> = {}
  protected _targetQueries: Record<string, string[]> = {}

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

  get individualAddressBatchQueryLimitConfig(): number {
    return this.config.individualAddressBatchQueryLimit ?? 10
  }

  get pollFrequencyConfig(): number {
    return this.config.pollFrequency ?? 1000
  }

  get queryCacheConfig(): LRUCache.Options<string, Pending | ModuleQueryResult, unknown> {
    const queryCacheConfig: CacheConfig | undefined = this.config.queryCache === true ? {} : this.config.queryCache
    return { max: 100, ttl: 1000 * 60, ...queryCacheConfig }
  }

  /**
   * A cache of the last offset of the Diviner process per address
   */
  protected get lastState(): LRUCache<string, number> {
    const requiredConfig = { max: 1000, ttl: 0 }
    this._lastState = this._lastState ?? new LRUCache<string, number>(requiredConfig)
    return this._lastState
  }

  protected get moduleName() {
    return `${this.config.name ?? moduleName}`
  }

  protected get queryArchivistConfig() {
    return this._configQueriesArchivist
  }

  protected get queryBoundWitnessDivinerConfig() {
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

  protected get responseArchivistConfig() {
    return this._configResponsesArchivist
  }

  protected get responseBoundWitnessDivinerConfig() {
    return this._configResponsesBoundWitnessDiviner
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
    this.logger?.debug(`${this.moduleName}: Begin issuing query to: ${address}`)
    const $meta = { ...query?.$meta, destination: [address] }
    const routedQuery = { ...query, $meta }
    const queryArchivist = await this.getQueryArchivist()
    if (!queryArchivist) throw new Error(`${this.moduleName}: Unable to resolve queryArchivist for query`)
    // TODO: Should we always re-hash to true up timestamps?  We can't
    // re-sign correctly so we would lose that information if we did and
    // would also be replying to consumers with a different query hash than
    // they sent us (which might be OK since it reflect the chain of custody)
    // Revisit this once we have proxy module support as they are another
    // intermediary to consider.
    const routedQueryHash =
      // Trust the signed hash if it's there
      (routedQuery as WithMeta<QueryBoundWitness>)?.$hash ??
      // TODO: What is the right way to find the dataHash
      Object.keys(await PayloadBuilder.toDataHashMap([routedQuery]))[0]
    this.logger?.debug(`${this.moduleName}: Issuing query: ${routedQueryHash} to: ${address}`)
    // If there was data associated with the query, add it to the insert
    const data = payloads ? [routedQuery, ...payloads] : [routedQuery]
    const insertResult = await queryArchivist.insert?.(data)
    this.logger?.debug(`${this.moduleName}: Issued query: ${routedQueryHash} to: ${address}`)
    this.queryCache.set(routedQueryHash, Pending)
    if (!insertResult) throw new Error(`${this.moduleName}: Unable to issue query to queryArchivist`)
    const context = new Promise<ModuleQueryResult>((resolve) => {
      this.logger?.debug(`${this.moduleName}: Polling for response to query: ${routedQueryHash}`)
      const pollForResponse = async () => {
        let response = this.queryCache.get(routedQueryHash)
        // Poll for response until cache key expires (response timed out)
        while (response !== undefined) {
          // Wait a bit
          await delay(100)
          // Check the status of the response
          response = this.queryCache.get(routedQueryHash)
          // If status is no longer pending that means we received a response
          if (response && response !== Pending) {
            this.logger?.debug(`${this.moduleName}: Returning response to query: ${routedQueryHash}`)
            resolve(response)
            return
          }
        }
        // If we got here waiting for a response timed out
        this.logger?.error(`${this.moduleName}: Timeout waiting for query response`)
        // Resolve with error to match what a local module would do if it were to error
        // TODO: BW Builder/Sign result as this module?
        const error: ModuleError = {
          message: 'Timeout waiting for query response',
          query: 'network.xyo.boundwitness',
          schema: 'network.xyo.error.module',
          sources: [routedQueryHash],
        }
        resolve([routedQuery, [], [error]])
        return
      }
      forget(pollForResponse())
    })
    return context
  }

  override targetQueryable(_address: string, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  /**
   * Commit the internal state of the process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param address The module address to commit the state for
   * @param nextState The state to commit
   */
  protected async commitState(address: string, nextState: number) {
    await Promise.resolve()
    // TODO: Offload to Archivist/Diviner instead of in-memory
    const lastState = this.lastState.get(address)
    if (lastState && lastState >= nextState) return
    this.lastState.set(address, nextState)
  }

  /**
   * Ensures the necessary config entries are present
   */
  protected ensureNecessaryConfig = () => {
    this._configRootAddress = assertEx(this.config.rootAddress, `${this.moduleName}: Missing entry for rootAddress in module configuration`)
    this._configQueriesArchivist = assertEx(
      this.config.queries?.archivist,
      `${this.moduleName}: Missing entry for query.archivist in module configuration`,
    )
    this._configQueriesBoundWitnessDiviner = assertEx(
      this.config.queries?.boundWitnessDiviner,
      `${this.moduleName}: Missing entry for query.boundWitnessDiviner in module configuration`,
    )
    this._configResponsesArchivist = assertEx(
      this.config.responses?.archivist,
      `${this.moduleName}: Missing entry for response.archivist in module configuration`,
    )
    this._configResponsesBoundWitnessDiviner = assertEx(
      this.config.responses?.boundWitnessDiviner,
      `${this.moduleName}: Missing entry for response.boundWitnessDiviner in module configuration`,
    )
    // this._configStateStoreArchivist = assertEx(
    //   this.config.stateStore?.archivist,
    //   `${this.moduleName}: Missing entry for stateStore.archivist in module configuration`,
    // )
    // this._configStateStoreBoundWitnessDiviner = assertEx(
    //   this.config.stateStore?.boundWitnessDiviner,
    //   `${this.moduleName}: Missing entry for stateStore.boundWitnessDiviner in module configuration`,
    // )
  }

  /**
   * Finds unprocessed commands addressed to the supplied address
   * @param address The address to find commands for
   */
  protected findCommandsToAddress = async (address: string) => {
    const queryBoundWitnessDiviner = await this.getQueryBoundWitnessDiviner()
    // Retrieve last offset from state store
    const timestamp = await this.retrieveState(address)
    const destination = [address]
    const limit = this.individualAddressBatchQueryLimitConfig
    // Filter for commands to us by destination address
    const divinerQuery = { destination, limit, schema: BoundWitnessDivinerQuerySchema, sort: 'asc', timestamp }
    const result = await queryBoundWitnessDiviner.divine([divinerQuery])
    const commands = result.filter(isQueryBoundWitness)
    const nextState = Math.max(...commands.map((c) => c.timestamp ?? 0))
    // TODO: This needs to be thought through as we can't use a distributed timestamp
    // because of collisions. We need to use the timestamp of the store so there's no
    // chance of multiple commands at the same time
    await this.commitState(address, nextState)
    return commands
  }

  protected getQueryArchivist = async () => {
    return assertEx(asArchivistInstance(await this.resolve(this.queryArchivistConfig)), `${this.moduleName}: Error resolving queryArchivist`)
  }

  protected getQueryBoundWitnessDiviner = async () => {
    return assertEx(
      asDivinerInstance(await this.resolve(this.queryBoundWitnessDivinerConfig)),
      `${this.moduleName}: Error resolving queryBoundWitnessDiviner`,
    )
  }

  protected getResponseArchivist = async () => {
    return assertEx(asArchivistInstance(await this.resolve(this.responseArchivistConfig)), `${this.moduleName}: Error resolving responseArchivist`)
  }

  protected getResponseBoundWitnessDiviner = async () => {
    return assertEx(
      asDivinerInstance(await this.resolve(this.responseBoundWitnessDivinerConfig)),
      `${this.moduleName}: Error resolving responseBoundWitnessDiviner`,
    )
  }

  // protected getStateStoreArchivist = async () => {
  //   return assertEx(
  //     asArchivistInstance(await this.resolve(this.stateStoreArchivistConfig)),
  //     `${this.moduleName}: Error resolving stateStoreArchivist`,
  //   )
  // }

  // protected getStateStoreBoundWitnessDiviner = async () => {
  //   return assertEx(
  //     asDivinerInstance(await this.resolve(this.stateStoreBoundWitnessDivinerConfig)),
  //     `${this.moduleName}: Error resolving stateStoreBoundWitnessDiviner`,
  //   )
  // }

  protected issueCommandAgainstLocalModule = async (localModule: ModuleInstance, command: QueryBoundWitness) => {
    const localModuleName = localModule.config.name ?? localModule.address
    const queryArchivist = await this.getQueryArchivist()
    const responseArchivist = await this.getResponseArchivist()
    const commandDestination = (command.$meta as { destination?: string[] })?.destination
    if (commandDestination && commandDestination?.includes(localModule.address)) {
      // Find the query
      const queryIndex = command.payload_hashes.indexOf(command.query)
      if (queryIndex !== -1) {
        const querySchema = command.payload_schemas[queryIndex]
        // If the destination can process this type of query
        if (localModule.queries.includes(querySchema)) {
          // Get the associated payloads
          const commandPayloads = await queryArchivist.get(command.payload_hashes)
          const commandPayloadsDict = await toMap(commandPayloads)
          const commandHash = isPayloadWithHash(command) ? command.$hash : await PayloadHasher.hash(command)
          // Check that we have all the arguments for the command
          if (!containsAll(Object.keys(commandPayloadsDict), command.payload_hashes)) {
            this.logger?.error(`${this.moduleName}: Error processing command ${commandHash} for module ${localModuleName}, missing payloads`)
            return
          }
          try {
            // Issue the query against module
            const commandSchema = commandPayloadsDict[command.query].schema
            this.logger?.debug(`${this.moduleName}: Issuing command ${commandSchema} (${commandHash}) addressed to module: ${localModuleName}`)
            const response = await localModule.query(command, commandPayloads)
            const [bw, payloads, errors] = response
            this.logger?.debug(`${this.moduleName}: Replying to command ${commandHash} addressed to module: ${localModuleName}`)
            const insertResult = await responseArchivist.insert([bw, ...payloads, ...errors])
            // NOTE: If all archivists support the contract that numPayloads inserted === numPayloads returned we can
            // do some deeper assertions here like lenIn === lenOut, but for now this should be good enough since BWs
            // should always be unique causing at least one insertion
            if (insertResult.length > 0) {
              this.logger?.error(`${this.moduleName}: Error replying to command ${commandHash} addressed to module: ${localModuleName}`)
            }
            if (command?.timestamp) {
              // TODO: This needs to be thought through as we can't use a distributed timestamp
              // because of collisions. We need to ensure we are using the timestamp of the store
              // so there's no chance of multiple commands at the same time
              await this.commitState(localModule.address, command.timestamp)
            }
          } catch (error) {
            this.logger?.error(`${this.moduleName}: Error processing command ${commandHash} for module ${localModuleName}: ${error}`)
          }
        }
      }
    }
  }

  /**
   * Retrieves the last state of the process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(address: string): Promise<number> {
    await Promise.resolve()
    const state = this.lastState.get(address)
    if (state === undefined) {
      // If this is a boot we can go back a bit in time
      // and begin processing recent commands
      const newState = Date.now() - 1000
      this.lastState.set(address, newState)
      return newState
    } else {
      return state
    }
  }

  protected override async startHandler(): Promise<boolean> {
    this.ensureNecessaryConfig()
    await this.connect()
    return true
  }

  protected override stopHandler(_timeout?: number | undefined): boolean {
    // TODO: There's more to it than this (global background circuit
    // breaker, timeoutEx management, etc.)
    if (this._pollId) clearTimeoutEx(this._pollId)
    this._pollId = undefined
    return true
  }

  private doBackgroundProcessing = async () => {
    // TODO: We should make it configurable if we want to be inbound, outbound, or both
    // as there is good reason for wanting to limit to just one or the other
    const results = await Promise.allSettled([await this.processIncomingQueries(), await this.processIncomingResponses()])
    for (const failure in results.filter(rejected)) {
      this.logger?.error(`${this.moduleName}: Error in background processing: ${failure}`)
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
        this.logger?.error?.(`${this.moduleName}: Error in main loop: ${e}`)
      } finally {
        if (this._pollId) clearTimeoutEx(this._pollId)
        this._pollId = undefined
        this.poll()
      }
    }, this.pollFrequencyConfig)
  }

  /**
   * Background process for checking for inbound commands
   */
  private processIncomingQueries = async () => {
    this.logger?.debug(`${this.moduleName}: Checking for inbound commands`)
    // Check for any queries that have been issued and have not been responded to
    const localModules = await this.resolve()
    // TODO: Ensure we filter out any proxy modules we created so we don't create a loopback
    const localAddresses = localModules.map((module) => module.address)
    // TODO: Do in throttled batches
    await Promise.allSettled(
      localAddresses.map(async (localAddress) => {
        try {
          const localModule = assertEx(await this.resolve(localAddress), `${this.moduleName}: Error resolving local address: ${localAddress}`)
          const localModuleName = localModule.config.name ?? localAddress
          this.logger?.debug(`${this.moduleName}: Checking for inbound commands to ${localModuleName}`)
          const commands = await this.findCommandsToAddress(localAddress)
          if (commands.length === 0) return
          this.logger?.debug(`${this.moduleName}: Found commands addressed to local module: ${localModuleName}`)
          for (const command of commands) {
            await this.issueCommandAgainstLocalModule(localModule, command)
          }
        } catch (error) {
          this.logger?.error(`${this.moduleName}: Error processing commands for address ${localAddress}: ${error}`)
        }
      }),
    )
  }

  /**
   * Background process for processing incoming responses to previously issued queries
   */
  private processIncomingResponses = async () => {
    const responseArchivist = await this.getResponseArchivist()
    const responseBoundWitnessDiviner = await this.getResponseBoundWitnessDiviner()
    const pendingCommands = [...this.queryCache.entries()].filter(([_, status]) => status === Pending)
    // TODO: Do in throttled batches
    await Promise.allSettled(
      pendingCommands.map(async ([sourceQuery, status]) => {
        if (status === Pending) {
          const divinerQuery = { schema: BoundWitnessDivinerQuerySchema, sourceQuery }
          const result = await responseBoundWitnessDiviner.divine([divinerQuery])
          if (result && result.length > 0) {
            const response = result.find(isBoundWitness)
            if (response && (response?.$meta as unknown as { sourceQuery: string })?.sourceQuery === sourceQuery) {
              this.logger?.debug(`${this.moduleName}: Found response to query: ${sourceQuery}`)
              // Get any payloads associated with the response
              const payloads = response.payload_hashes?.length > 0 ? await responseArchivist.get(response.payload_hashes) : []
              const errors: ModuleError[] = []
              this.queryCache.set(sourceQuery, [response, payloads, errors])
            }
          }
        }
      }),
    )
  }
}
