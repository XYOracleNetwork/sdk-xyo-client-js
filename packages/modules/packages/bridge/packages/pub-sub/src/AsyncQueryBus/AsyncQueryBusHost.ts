import {
  assertEx, clearTimeoutEx, containsAll, setTimeoutEx,
} from '@xylabs/sdk-js'
import {
  type Address, hexFromBigInt, hexToBigInt,
} from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { isQueryBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { isBridgeInstance } from '@xyo-network/bridge-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import type {
  ModuleIdentifier,
  ModuleInstance,
} from '@xyo-network/module-model'
import {
  asModuleInstance,
  ModuleConfigSchema,
  resolveAddressToInstance,
  ResolveHelper,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Schema, Sequence, WithStorageMeta,
} from '@xyo-network/payload-model'
import { SequenceConstants } from '@xyo-network/payload-model'

import { AsyncQueryBusBase } from './AsyncQueryBusBase.ts'
import type { AsyncQueryBusHostParams } from './model/index.ts'

export interface ExposeOptions {
  allowedQueries?: Schema[]
  failOnAlreadyExposed?: boolean
}

const IDLE_POLLING_FREQUENCY_RATIO_MIN = 4 as const
const IDLE_POLLING_FREQUENCY_RATIO_MAX = 64 as const
const IDLE_POLLING_FREQUENCY_RATIO_DEFAULT = 16 as const

const IDLE_THRESHOLD_RATIO_MIN = 4 as const
const IDLE_THRESHOLD_RATIO_MAX = 64 as const
const IDLE_THRESHOLD_RATIO_DEFAULT = 16 as const

function bigintMax(...args: bigint[]): bigint {
  if (args.length === 0) throw new Error('No values provided to bigintMax')
  // eslint-disable-next-line unicorn/prefer-math-min-max, unicorn/no-array-reduce
  return args.reduce((max, val) => (val > max ? val : max))
}

export class AsyncQueryBusHost<TParams extends AsyncQueryBusHostParams = AsyncQueryBusHostParams> extends AsyncQueryBusBase<TParams> {
  protected _exposedAddresses = new Set<Address>()
  private _exposeOptions: Record<Address, ExposeOptions> = {}
  private _idle = false
  private _lastQueryTime?: number
  private _pollId?: string

  constructor(params: TParams) {
    super(params)
  }

  get exposedAddresses() {
    return this._exposedAddresses
  }

  get idlePollFrequency() {
    const frequency = this.config?.idlePollFrequency ?? IDLE_POLLING_FREQUENCY_RATIO_DEFAULT * this.pollFrequency
    if (frequency < this.pollFrequency * IDLE_POLLING_FREQUENCY_RATIO_MIN) {
      return IDLE_POLLING_FREQUENCY_RATIO_MIN * this.pollFrequency
    }
    if (frequency > this.pollFrequency * IDLE_POLLING_FREQUENCY_RATIO_MAX) {
      return IDLE_POLLING_FREQUENCY_RATIO_MAX * this.pollFrequency
    }
    return frequency
  }

  get idleThreshold() {
    const threshold = this.config?.idleThreshold ?? IDLE_THRESHOLD_RATIO_DEFAULT * this.idlePollFrequency
    if (threshold < this.idlePollFrequency * IDLE_THRESHOLD_RATIO_MIN) {
      return IDLE_POLLING_FREQUENCY_RATIO_MIN * this.pollFrequency
    }
    if (threshold > this.idlePollFrequency * IDLE_THRESHOLD_RATIO_MAX) {
      return IDLE_POLLING_FREQUENCY_RATIO_MAX * this.pollFrequency
    }
    return threshold
  }

  get perAddressBatchQueryLimit(): number {
    return this.config?.perAddressBatchQueryLimit ?? 10
  }

  get started() {
    return !!this._pollId
  }

  expose(mod: ModuleInstance, options?: ExposeOptions) {
    const { failOnAlreadyExposed } = options ?? {}
    if (isBridgeInstance(mod)) {
      this.logger?.warn(`Attempted to expose a BridgeModule [${mod.id}] - Not exposing`)
    } else {
      assertEx(!failOnAlreadyExposed || !this._exposedAddresses.has(mod.address), () => `Address already exposed: ${mod.id} [${mod.address}]`)
      this._exposedAddresses.add(mod.address)
      this._exposeOptions[mod.address] = { ...options }
      this.logger?.debug(`${mod.id} exposed [${mod.address}]`)
      return mod
    }
  }

  async listeningModules(): Promise<ModuleInstance[]> {
    const exposedModules = [...(this.config?.listeningModules ?? []), ...this.exposedAddresses.values()]
    return await Promise.all(
      exposedModules.map(async exposedModule =>
        assertEx(
          asModuleInstance(await resolveAddressToInstance(this.rootModule, exposedModule)),
          () => `Unable to resolve listeningModule [${exposedModule}]`,
        )),
    )
  }

  start() {
    if (this.started) {
      console.warn('AsyncQueryBus starting when already started')
    }
    this.poll()
  }

  stop() {
    if (!this.started) {
      console.warn('AsyncQueryBus stopping when already stopped')
    }
    if (this._pollId) clearTimeoutEx(this._pollId)
    this._pollId = undefined
  }

  async unexpose(id: ModuleIdentifier, validate = true) {
    const mod = asModuleInstance(await this.rootModule.resolve(id, { maxDepth: 10 }))
    if (mod) {
      assertEx(!validate || this._exposedAddresses.has(mod.address), () => `Address not exposed [${mod.address}][${mod.id}]`)
      this._exposedAddresses.delete(mod.address)
      delete this._exposeOptions[mod.address]
      this.logger?.debug(`${mod.address} [${mod.id}] unexposed`)
    }
    return mod
  }

  // eslint-disable-next-line complexity
  protected callLocalModule = async (localModule: ModuleInstance, query: WithStorageMeta<QueryBoundWitness>) => {
    this._idle = false
    this._lastQueryTime = Date.now()
    const localModuleName = localModule.id
    const queryArchivist = assertEx(
      await this.queriesArchivist(),
      () => `Unable to contact queriesArchivist [${this.config?.intersect?.queries?.archivist}]`,
    )
    const responsesArchivist = assertEx(
      await this.responsesArchivist(),
      () => `Unable to contact responsesArchivist [${this.config?.intersect?.queries?.archivist}]`,
    )
    const queryDestination = query?.$destination
    if (queryDestination && queryDestination?.includes(localModule.address)) {
      // Find the query
      const queryIndex = query.payload_hashes.indexOf(query.query)
      if (queryIndex !== -1) {
        const querySchema = query.payload_schemas[queryIndex]
        // If the destination can process this type of query
        if (localModule.queries.includes(querySchema)) {
          // Get the associated payloads
          const queryPayloads = await queryArchivist.get(query.payload_hashes)
          this.params.onQueryFulfillStarted?.({ payloads: queryPayloads, query })
          const queryPayloadsDict = await PayloadBuilder.toAllHashMap(queryPayloads)
          const queryHash = await PayloadBuilder.dataHash(query)
          // Check that we have all the arguments for the command
          if (!containsAll(Object.keys(queryPayloadsDict), query.payload_hashes)) {
            this.logger?.error(`Error processing command ${queryHash} for module ${localModuleName}, missing payloads`)
            return
          }
          try {
            // Issue the query against module
            const querySchema = queryPayloadsDict[query.query].schema
            this.logger?.debug(`Issuing query ${querySchema} (${queryHash}) addressed to module: ${localModuleName}`)
            const result = await localModule.query(query, queryPayloads, {
              allowedQueries: this._exposeOptions[localModule.address]?.allowedQueries,
              schema: ModuleConfigSchema,
            })
            const [bw, payloads, errors] = result
            this.logger?.debug(`Replying to query ${queryHash} addressed to module: ${localModuleName}`)
            const insertResult = await responsesArchivist.insert([bw, ...payloads, ...errors])
            // If all archivists support the contract that numPayloads inserted === numPayloads returned we can
            // do some deeper assertions here like lenIn === lenOut, but for now this should be good enough since BWs
            // should always be unique causing at least one insertion
            if (insertResult.length === 0) {
              this.logger?.error(`Error replying to query ${queryHash} addressed to module: ${localModuleName}`)
            }
            if (query?._sequence) {
              // TODO: This needs to be thought through as we can't use a distributed timestamp
              // because of collisions. We need to ensure we are using the timestamp of the store
              // so there's no chance of multiple commands at the same time
              await this.commitState(localModule.address, query._sequence)
            }
            this.params.onQueryFulfillFinished?.({
              payloads: queryPayloads, query, result, status: 'success',
            })
          } catch (error) {
            this.params.onQueryFulfillFinished?.({
              payloads: queryPayloads, query, status: 'failure',
            })
            this.logger?.error(`Error processing query ${queryHash} for module ${localModuleName}: ${error}`)
          }
        }
      }
    }
  }

  /**
   * Finds unprocessed commands addressed to the supplied address
   * @param address The address to find commands for
   */
  protected findQueriesToAddress = async (address: Address) => {
    const queriesDivinerId = assertEx(this.config?.intersect?.queries?.boundWitnessDiviner, () => 'No queries Diviner defined')
    const queriesBoundWitnessDiviner = await this.queriesDiviner()
    if (queriesBoundWitnessDiviner) {
      // Retrieve last offset from state store
      const prevState = await this.retrieveState(address)
      const destination = [address]
      const limit = this.perAddressBatchQueryLimit
      // Filter for commands to us by destination address
      const divinerQuery: BoundWitnessDivinerQueryPayload = {
        destination,
        limit,
        order: 'asc',
        schema: BoundWitnessDivinerQuerySchema,
        cursor: prevState,
      }
      const result = await queriesBoundWitnessDiviner.divine([divinerQuery])
      const queries = result.filter(isQueryBoundWitnessWithStorageMeta)
      // eslint-disable-next-line unicorn/no-array-reduce
      const highestQuerySequence = queries.reduce(
        (acc, query) => (hexFromBigInt(bigintMax(hexToBigInt(query._sequence), hexToBigInt(acc)))) as Sequence,
        SequenceConstants.minLocalSequence as Sequence,
      )
      const nextState = queries.length > 0 ? highestQuerySequence : SequenceConstants.minLocalSequence
      // TODO: This needs to be thought through as we can't use a distributed timestamp
      // because of collisions. We need to use the timestamp of the store so there's no
      // chance of multiple commands at the same time
      await this.commitState(address, nextState)
      this.logger?.debug('findQueriesToAddress', address, prevState, nextState)
      return queries
    } else {
      this.logger?.warn(
        `Unable to resolve queriesBoundWitnessDiviner [${queriesDivinerId}] [${await ResolveHelper.traceModuleIdentifier(this.rootModule, queriesDivinerId)}]`,
      )
    }
  }

  /**
   * Runs the background divine process on a loop with a delay
   * specified by the `config.pollFrequency`
   */
  private poll() {
    this._pollId = setTimeoutEx(
      async () => {
        try {
          await this.processIncomingQueries()
        } catch (e) {
          this.logger?.error?.(`Error in main loop: ${e}`)
        } finally {
          if (this._pollId) clearTimeoutEx(this._pollId)
          this._pollId = undefined
          this.poll()
        }
        const now = Date.now()
        if (this.idleThreshold < now - (this._lastQueryTime ?? now)) {
          this._idle = true
        }
      },
      this._idle ? this.idlePollFrequency : this.pollFrequency,
    )
  }

  /**
   * Background process for checking for inbound queries
   */
  private processIncomingQueries = async () => {
    this.logger?.debug('Checking for inbound queries')
    // Check for any queries that have been issued and have not been responded to
    const localModules = await this.listeningModules()

    // TODO: Do in throttled batches
    await Promise.allSettled(
      localModules.map(async (localModule) => {
        try {
          const localModuleName = localModule.id
          this.logger?.debug(`Checking for inbound queries to ${localModuleName} [${localModule.address}]`)
          const queries = (await this.findQueriesToAddress(localModule.address)) ?? []
          if (queries.length === 0) return
          this.logger?.debug(`Found queries addressed to local module: ${localModuleName}`)
          for (const query of queries) {
            await this.callLocalModule(localModule, query)
          }
        } catch (error) {
          this.logger?.error(`Error processing queries for address ${localModule.address}: ${error}`)
        }
      }),
    )
  }
}
