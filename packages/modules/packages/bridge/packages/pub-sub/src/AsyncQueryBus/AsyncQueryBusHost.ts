import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import { isQueryBoundWitnessWithMeta, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asModuleInstance, ModuleConfigSchema, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Schema, WithMeta } from '@xyo-network/payload-model'

import { AsyncQueryBusBase } from './AsyncQueryBusBase'
import { AsyncQueryBusHostParams } from './model'

export interface ExposeOptions {
  allowedQueries?: Schema[]
  failOnAlreadyExposed?: boolean
  required?: boolean
}

export class AsyncQueryBusHost<TParams extends AsyncQueryBusHostParams = AsyncQueryBusHostParams> extends AsyncQueryBusBase<TParams> {
  protected _exposedAddresses = new Set<Address>()
  private _exposeOptions: Record<Address, ExposeOptions> = {}
  private _pollId?: string

  constructor(params: TParams) {
    super(params)
  }

  get exposedAddresses() {
    return this._exposedAddresses
  }

  get perAddressBatchQueryLimit(): number {
    return this.config?.perAddressBatchQueryLimit ?? 10
  }

  get started() {
    return !!this._pollId
  }

  async expose(id: ModuleIdentifier, options?: ExposeOptions) {
    const { failOnAlreadyExposed, required = true } = options ?? {}
    const module = asModuleInstance(await this.resolver.resolve(id, { maxDepth: 10 }))
    if (!module && required) {
      throw new Error(`Unable to resolve module to expose [${id}]`)
    }
    if (module) {
      assertEx(!failOnAlreadyExposed || !this._exposedAddresses.has(module.address), () => `Address already exposed: ${id} [${module.address}]`)
      this._exposedAddresses.add(module.address)
      this._exposeOptions[module.address] = { ...options }
      this.logger?.debug(`${id} exposed [${module.address}]`)
      return module
    }
  }

  async listeningModules(): Promise<ModuleInstance[]> {
    const exposedModules = [...(this.config?.listeningModules ?? []), ...this.exposedAddresses.values()]
    const mods = await Promise.all(
      exposedModules.map(async (exposedModule) =>
        assertEx(
          asModuleInstance(await this.resolver.resolve(exposedModule, { maxDepth: 10 })),
          () => `Unable to resolve listeningModule [${exposedModule}]`,
        ),
      ),
    )
    return mods
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
    const module = asModuleInstance(await this.resolver.resolve(id, { maxDepth: 10 }))
    if (module) {
      assertEx(!validate || this._exposedAddresses.has(module.address), () => `Address not exposed [${module.address}][${module.id}]`)
      this._exposedAddresses.delete(module.address)
      delete this._exposeOptions[module.address]
      this.logger?.debug(`${module.address} [${module.id}] unexposed`)
    }
    return module
  }

  protected callLocalModule = async (localModule: ModuleInstance, query: WithMeta<QueryBoundWitness>) => {
    const localModuleName = localModule.config.name ?? localModule.address
    const queryArchivist = assertEx(
      await this.queriesArchivist(),
      () => `Unable to contact queriesArchivist [${this.config?.intersect?.queries?.archivist}]`,
    )
    const responsesArchivist = assertEx(
      await this.responsesArchivist(),
      () => `Unable to contact responsesArchivist [${this.config?.intersect?.queries?.archivist}]`,
    )
    const queryDestination = (query.$meta as { destination?: string[] })?.destination
    if (queryDestination && queryDestination?.includes(localModule.address)) {
      // Find the query
      const queryIndex = query.payload_hashes.indexOf(query.query)
      if (queryIndex !== -1) {
        const querySchema = query.payload_schemas[queryIndex]
        // If the destination can process this type of query
        if (localModule.queries.includes(querySchema)) {
          // Get the associated payloads
          const queryPayloads = await queryArchivist.get(query.payload_hashes)
          const queryPayloadsDict = await PayloadBuilder.toAllHashMap(queryPayloads)
          const queryHash = (await PayloadBuilder.build(query)).$hash
          // Check that we have all the arguments for the command
          if (!containsAll(Object.keys(queryPayloadsDict), query.payload_hashes)) {
            this.logger?.error(`Error processing command ${queryHash} for module ${localModuleName}, missing payloads`)
            return
          }
          try {
            // Issue the query against module
            const querySchema = queryPayloadsDict[query.query].schema
            this.logger?.debug(`Issuing query ${querySchema} (${queryHash}) addressed to module: ${localModuleName}`)
            const response = await localModule.query(query, queryPayloads, {
              allowedQueries: this._exposeOptions[localModule.address]?.allowedQueries,
              schema: ModuleConfigSchema,
            })
            const [bw, payloads, errors] = response
            this.logger?.debug(`Replying to query ${queryHash} addressed to module: ${localModuleName}`)
            const insertResult = await responsesArchivist.insert([bw, ...payloads, ...errors])
            // NOTE: If all archivists support the contract that numPayloads inserted === numPayloads returned we can
            // do some deeper assertions here like lenIn === lenOut, but for now this should be good enough since BWs
            // should always be unique causing at least one insertion
            if (insertResult.length === 0) {
              this.logger?.error(`Error replying to query ${queryHash} addressed to module: ${localModuleName}`)
            }
            if (query?.timestamp) {
              // TODO: This needs to be thought through as we can't use a distributed timestamp
              // because of collisions. We need to ensure we are using the timestamp of the store
              // so there's no chance of multiple commands at the same time
              await this.commitState(localModule.address, query.timestamp)
            }
          } catch (error) {
            this.logger?.error(`Error processing query ${queryHash} for module ${localModuleName}: ${error}`)
            console.error(`Error processing query ${queryHash} for module ${localModuleName}: ${error}`)
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
    const queryBoundWitnessDiviner = await this.queriesDiviner()
    if (queryBoundWitnessDiviner) {
      // Retrieve last offset from state store
      const timestamp = await this.retrieveState(address)
      const destination = [address]
      const limit = this.perAddressBatchQueryLimit
      // Filter for commands to us by destination address
      const divinerQuery = { destination, limit, schema: BoundWitnessDivinerQuerySchema, sort: 'asc', timestamp }
      const result = await queryBoundWitnessDiviner.divine([divinerQuery])
      const queries = result.filter(isQueryBoundWitnessWithMeta)
      const nextState = queries.length > 0 ? Math.max(...queries.map((c) => c.timestamp ?? 0)) + 1 : timestamp
      // TODO: This needs to be thought through as we can't use a distributed timestamp
      // because of collisions. We need to use the timestamp of the store so there's no
      // chance of multiple commands at the same time
      await this.commitState(address, nextState)
      return queries
    } else {
      this.logger?.warn(`Unable to resolve queryBoundWitnessDiviner [${this.config?.intersect?.queries?.boundWitnessDiviner}]`)
    }
  }

  /**
   * Runs the background divine process on a loop with a delay
   * specified by the `config.pollFrequency`
   */
  private poll() {
    this._pollId = setTimeoutEx(async () => {
      try {
        await this.processIncomingQueries()
      } catch (e) {
        this.logger?.error?.(`Error in main loop: ${e}`)
      } finally {
        if (this._pollId) clearTimeoutEx(this._pollId)
        this._pollId = undefined
        this.poll()
      }
    }, this.pollFrequencyConfig)
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
          const localModuleName = localModule.config.name ?? localModule.address
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
