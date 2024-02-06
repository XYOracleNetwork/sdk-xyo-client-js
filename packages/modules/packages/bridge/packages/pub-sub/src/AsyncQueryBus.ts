/* eslint-disable max-lines */
import { containsAll } from '@xylabs/array'
import { delay } from '@xylabs/delay'
import { forget } from '@xylabs/forget'
import { Base } from '@xylabs/object'
import { rejected } from '@xylabs/promise'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import { isBoundWitness, isQueryBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { CacheConfig } from '@xyo-network/bridge-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { ModuleConfig, ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadWithHash, ModuleError, Payload, WithMeta } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusParams } from './Params'

export const Pending = 'pending' as const
export type Pending = typeof Pending

export class AsyncQueryBus<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends Base<TParams> {
  protected _lastState?: LRUCache<string, number>
  protected _queryCache?: LRUCache<string, Pending | ModuleQueryResult>
  protected _targetConfigs: Record<string, ModuleConfig> = {}
  protected _targetQueries: Record<string, string[]> = {}

  protected moduleName = 'AsyncQueryBus'

  private _pollId?: string

  constructor(params: TParams) {
    super(params)
  }

  get config() {
    return this.params.config
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

  /**
   * A cache of queries that have been issued
   */
  protected get queryCache(): LRUCache<string, Pending | ModuleQueryResult> {
    const config = this.queryCacheConfig
    const requiredConfig = { noUpdateTTL: false, ttlAutopurge: true }
    this._queryCache = this._queryCache ?? new LRUCache<string, Pending | ModuleQueryResult>({ ...config, ...requiredConfig })
    return this._queryCache
  }

  async send(address: string, query: QueryBoundWitness, payloads?: Payload[] | undefined): Promise<ModuleQueryResult> {
    this.logger?.debug(`${this.moduleName}: Begin issuing query to: ${address}`)
    const $meta = { ...query?.$meta, destination: [address] }
    const routedQuery = { ...query, $meta }
    const queryArchivist = this.params.queries.archivist
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

  start() {
    this.poll()
  }

  stop() {
    if (this._pollId) clearTimeoutEx(this._pollId)
    this._pollId = undefined
  }

  protected callLocalModule = async (localModule: ModuleInstance, command: QueryBoundWitness) => {
    console.log(`callLocalModule: ${localModule.address}`)
    const localModuleName = localModule.config.name ?? localModule.address
    const queryArchivist = this.params.queries.archivist
    const responseArchivist = this.params.responses.archivist
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
          const commandPayloadsDict = await PayloadBuilder.toAllHashMap(commandPayloads)
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
   * Finds unprocessed commands addressed to the supplied address
   * @param address The address to find commands for
   */
  protected findCommandsToAddress = async (address: string) => {
    const queryBoundWitnessDiviner = this.params.queries.boundWitnessDiviner
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
    const localModules = await this.params.listeningModules()

    // TODO: Do in throttled batches
    await Promise.allSettled(
      localModules.map(async (localModule) => {
        try {
          const localModuleName = localModule.config.name ?? localModule.address
          this.logger?.debug(`${this.moduleName}: Checking for inbound commands to ${localModuleName}`)
          const commands = await this.findCommandsToAddress(localModule.address)
          if (commands.length === 0) return
          this.logger?.debug(`${this.moduleName}: Found commands addressed to local module: ${localModuleName}`)
          for (const command of commands) {
            await this.callLocalModule(localModule, command)
          }
        } catch (error) {
          this.logger?.error(`${this.moduleName}: Error processing commands for address ${localModule.address}: ${error}`)
        }
      }),
    )
  }

  /**
   * Background process for processing incoming responses to previously issued queries
   */
  private processIncomingResponses = async () => {
    const responseArchivist = this.params.responses.archivist
    const responseBoundWitnessDiviner = this.params.responses.boundWitnessDiviner
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
