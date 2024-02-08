import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import { isQueryBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { asModuleInstance, ModuleInstance } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadWithHash } from '@xyo-network/payload-model'

import { AsyncQueryBusBase } from './AsyncQueryBusBase'
import { AsyncQueryBusParams } from './Params'

export class AsyncQueryBusServer<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends AsyncQueryBusBase<TParams> {
  private _pollId?: string

  constructor(params: TParams) {
    super(params)
  }

  get started() {
    return !!this._pollId
  }

  async listeningModules() {
    const mods = this.config.listeningModules
      ? await Promise.all(
          this.config.listeningModules.map(async (listeningModule) =>
            assertEx(asModuleInstance(await this.resolver.resolve(listeningModule)), () => `Unable to resolve listeningModule [${listeningModule}]`),
          ),
        )
      : await this.resolver.resolve({ direction: 'all' })
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

  protected callLocalModule = async (localModule: ModuleInstance, command: QueryBoundWitness) => {
    const localModuleName = localModule.config.name ?? localModule.address
    const queryArchivist = await this.queriesArchivist()
    const responseArchivist = await this.responsesArchivist()
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
            this.logger?.error(`Error processing command ${commandHash} for module ${localModuleName}, missing payloads`)
            return
          }
          try {
            // Issue the query against module
            const commandSchema = commandPayloadsDict[command.query].schema
            this.logger?.debug(`Issuing command ${commandSchema} (${commandHash}) addressed to module: ${localModuleName}`)
            const response = await localModule.query(command, commandPayloads)
            const [bw, payloads, errors] = response
            this.logger?.debug(`Replying to command ${commandHash} addressed to module: ${localModuleName}`)
            const insertResult = await responseArchivist.insert([bw, ...payloads, ...errors])
            // NOTE: If all archivists support the contract that numPayloads inserted === numPayloads returned we can
            // do some deeper assertions here like lenIn === lenOut, but for now this should be good enough since BWs
            // should always be unique causing at least one insertion
            if (insertResult.length > 0) {
              this.logger?.error(`Error replying to command ${commandHash} addressed to module: ${localModuleName}`)
            }
            if (command?.timestamp) {
              // TODO: This needs to be thought through as we can't use a distributed timestamp
              // because of collisions. We need to ensure we are using the timestamp of the store
              // so there's no chance of multiple commands at the same time
              await this.commitState(localModule.address, command.timestamp)
            }
          } catch (error) {
            this.logger?.error(`Error processing command ${commandHash} for module ${localModuleName}: ${error}`)
          }
        }
      }
    }
  }

  /**
   * Finds unprocessed commands addressed to the supplied address
   * @param address The address to find commands for
   */
  protected findCommandsToAddress = async (address: string) => {
    const queryBoundWitnessDiviner = await this.queriesDiviner()
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
   * Background process for checking for inbound commands
   */
  private processIncomingQueries = async () => {
    this.logger?.debug('Checking for inbound commands')
    // Check for any queries that have been issued and have not been responded to
    const localModules = await this.listeningModules()

    // TODO: Do in throttled batches
    await Promise.allSettled(
      localModules.map(async (localModule) => {
        try {
          const localModuleName = localModule.config.name ?? localModule.address
          this.logger?.debug(`Checking for inbound commands to ${localModuleName}`)
          const commands = await this.findCommandsToAddress(localModule.address)
          if (commands.length === 0) return
          this.logger?.debug(`Found commands addressed to local module: ${localModuleName}`)
          for (const command of commands) {
            await this.callLocalModule(localModule, command)
          }
        } catch (error) {
          this.logger?.error(`Error processing commands for address ${localModule.address}: ${error}`)
        }
      }),
    )
  }
}
