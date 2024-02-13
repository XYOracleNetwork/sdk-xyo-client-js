import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { forget } from '@xylabs/forget'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import { BoundWitness, isBoundWitnessWithMeta, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, Payload, WithMeta } from '@xyo-network/payload-model'

import { AsyncQueryBusBase } from './AsyncQueryBusBase'
import { Pending } from './Config'
import { AsyncQueryBusParams } from './Params'

export class AsyncQueryBusClient<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends AsyncQueryBusBase<TParams> {
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
            assertEx(
              asModuleInstance(await this.resolver.resolve(listeningModule)),
              () => `Unable to resolve all listeningModule [${listeningModule}]`,
            ),
          ),
        )
      : await this.resolver.resolve({ direction: 'all' })
    return mods
  }

  async send(address: string, query: QueryBoundWitness, payloads?: Payload[] | undefined): Promise<ModuleQueryResult> {
    this.logger?.debug(`Begin issuing query to: ${address}`)
    const $meta = { ...query?.$meta, destination: [address] }
    const routedQuery = await PayloadBuilder.build({ ...query, $meta })
    const queryArchivist = await this.queriesArchivist()

    const sourceAddress = query.addresses.at(0)
    if (sourceAddress && !this.config.listeningModules?.includes(sourceAddress)) {
      this.config.listeningModules?.push(sourceAddress)
    }

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
    this.logger?.debug(`Issuing query: ${routedQueryHash} to: ${address}`)
    // If there was data associated with the query, add it to the insert
    const data = payloads ? [routedQuery, ...payloads] : [routedQuery]
    const insertResult = await queryArchivist.insert?.(data)
    this.logger?.debug(`Issued query: ${routedQueryHash} to: ${address}`)
    this.queryCache.set(routedQueryHash, Pending)
    if (!insertResult) throw new Error('Unable to issue query to queryArchivist')
    const context = new Promise<ModuleQueryResult>((resolve) => {
      this.logger?.debug(`Polling for response to query: ${routedQueryHash}`)
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
            this.logger?.debug(`Returning response to query: ${routedQueryHash}`)
            resolve(response)
            return
          }
        }
        // If we got here waiting for a response timed out
        this.logger?.error('Timeout waiting for query response')
        // Resolve with error to match what a local module would do if it were to error
        // TODO: BW Builder/Sign result as this module?
        const error: ModuleError = {
          message: 'Timeout waiting for query response',
          query: 'network.xyo.boundwitness',
          schema: 'network.xyo.error.module',
          sources: [routedQueryHash],
        }
        resolve([routedQuery, [], [await PayloadBuilder.build(error)]])
        return
      }
      forget(pollForResponse())
    })
    return context
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

  /**
   * Runs the background divine process on a loop with a delay
   * specified by the `config.pollFrequency`
   */
  private poll() {
    this._pollId = setTimeoutEx(async () => {
      try {
        await this.processIncomingResponses()
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
   * Background process for processing incoming responses to previously issued queries
   */
  private processIncomingResponses = async () => {
    const responseArchivist = await this.responsesArchivist()
    const responseBoundWitnessDiviner = await this.responsesDiviner()
    const pendingCommands = [...this.queryCache.entries()].filter(([_, status]) => status === Pending)
    // TODO: Do in throttled batches
    await Promise.allSettled(
      pendingCommands.map(async ([sourceQuery, status]) => {
        if (status === Pending) {
          const divinerQuery = { schema: BoundWitnessDivinerQuerySchema, sourceQuery }
          const result = await responseBoundWitnessDiviner.divine([divinerQuery])
          if (result && result.length > 0) {
            const response = result.find(isBoundWitnessWithMeta)
            if (response && (response?.$meta as unknown as { sourceQuery: string })?.sourceQuery === sourceQuery) {
              this.logger?.debug(`Found response to query: ${sourceQuery}`)
              // Get any payloads associated with the response
              const payloads = response.payload_hashes?.length > 0 ? await responseArchivist.get(response.payload_hashes) : []
              this.queryCache.set(sourceQuery, [response, payloads, []])
            }
          }
        }
      }),
    )
  }
}
