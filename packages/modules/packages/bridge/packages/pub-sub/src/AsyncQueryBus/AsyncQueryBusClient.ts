import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { forget } from '@xylabs/forget'
import type { Address, Hash } from '@xylabs/hex'
import { clearTimeoutEx, setTimeoutEx } from '@xylabs/timer'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import type { CacheConfig, ModuleQueryResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  ModuleError, Payload, WithSources,
} from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusBase } from './AsyncQueryBusBase.ts'
import type { AsyncQueryBusClientParams } from './model/index.ts'
import { Pending } from './model/index.ts'

export class AsyncQueryBusClient<TParams extends AsyncQueryBusClientParams = AsyncQueryBusClientParams> extends AsyncQueryBusBase<TParams> {
  protected _queryCache?: LRUCache<Hash, Pending | ModuleQueryResult>
  private _pollCount = 0
  private _pollId?: string

  constructor(params: TParams) {
    super(params)
  }

  get queryCacheConfig(): LRUCache.Options<Hash, Pending | ModuleQueryResult, unknown> {
    const queryCacheConfig: CacheConfig | undefined = this.config?.queryCache === true ? {} : this.config?.queryCache
    return {
      max: 100, ttl: 1000 * 60, ...queryCacheConfig,
    }
  }

  get started() {
    return !!this._pollId
  }

  /**
   * A cache of queries that have been issued
   */
  protected get queryCache(): LRUCache<Hash, Pending | ModuleQueryResult> {
    const config = this.queryCacheConfig
    const requiredConfig = { noUpdateTTL: false, ttlAutopurge: true }
    this._queryCache = this._queryCache ?? new LRUCache<Hash, Pending | ModuleQueryResult>({ ...config, ...requiredConfig })
    return this._queryCache
  }

  listeningAddresses() {
    return this._queryCache?.keys()
  }

  async send(address: Address, query: QueryBoundWitness, payloads?: Payload[] | undefined): Promise<ModuleQueryResult> {
    this.logger?.debug(`Begin issuing query to: ${address}`)
    const routedQuery = { ...query, $destination: [address] }
    // console.log('queryArchivist - calling')
    const queryArchivist = assertEx(
      await this.queriesArchivist(),
      () => `Unable to contact queriesArchivist [${this.config?.intersect?.queries?.archivist}]`,
    )
    // console.log('queryArchivist')

    // TODO: Should we always re-hash to true up timestamps?  We can't
    // re-sign correctly so we would lose that information if we did and
    // would also be replying to consumers with a different query hash than
    // they sent us (which might be OK since it reflect the chain of custody)
    // Revisit this once we have proxy module support as they are another
    // intermediary to consider.
    const routedQueryHash = await PayloadBuilder.dataHash(routedQuery)
    this.logger?.debug(`Issuing query: ${routedQueryHash} to: ${address}`)
    // If there was data associated with the query, add it to the insert
    const data = payloads ? [routedQuery, ...payloads] : [routedQuery]
    const insertResult = await queryArchivist.insert?.(data)
    this.logger?.debug(`Issued query: ${routedQueryHash} to: ${address}`)
    this.queryCache.set(routedQueryHash, Pending)
    if (!insertResult) throw new Error('Unable to issue query to queryArchivist')
    return new Promise<ModuleQueryResult>((resolve, reject) => {
      this.logger?.debug(`Polling for response to query: ${routedQueryHash}`)
      let nextDelay = 100
      const pollForResponse = async () => {
        try {
          this.start()
          let response = this.queryCache.get(routedQueryHash)
          // Poll for response until cache key expires (response timed out)
          while (response !== undefined) {
            // console.log('polling...')
            // Wait a bit
            await delay(nextDelay)
            // Check the status of the response
            response = this.queryCache.get(routedQueryHash)
            // If status is no longer pending that means we received a response
            if (response && response !== Pending) {
              this.logger?.log(`Returning response to query: ${routedQueryHash}`)
              resolve(response)
              return
            }
            // back off the polling frequency
            nextDelay = Math.floor(nextDelay * 1.2)
            // cap it at 1000ms
            if (nextDelay > 1000) nextDelay = 1000
          }
          // If we got here waiting for a response timed out
          this.logger?.error('Timeout waiting for query response')
          // Resolve with error to match what a local module would do if it were to error
          // TODO: BW Builder/Sign result as this module?
          const error: WithSources<ModuleError> = {
            message: 'Timeout waiting for query response',
            query: 'network.xyo.boundwitness',
            schema: 'network.xyo.error.module',
            $sources: [routedQueryHash],
          }
          reject(error)
          return
        } finally {
          this.stop()
        }
      }
      forget(pollForResponse())
    })
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
    }, this.pollFrequency)
  }

  /**
   * Background process for processing incoming responses to previously issued queries
   */
  private processIncomingResponses = async () => {
    const responseArchivist = await this.responsesArchivist()
    if (responseArchivist) {
      const responseBoundWitnessDiviner = await this.responsesDiviner()
      if (responseBoundWitnessDiviner) {
        const pendingCommands = [...this.queryCache.entries()].filter(([_, status]) => status === Pending)
        // TODO: Do in throttled batches
        await Promise.allSettled(
          pendingCommands.map(async ([sourceQuery, status]) => {
            if (status === Pending) {
              const divinerQuery: BoundWitnessDivinerQueryPayload = {
                limit: 1, order: 'desc', schema: BoundWitnessDivinerQuerySchema, sourceQuery,
              }
              const result = await responseBoundWitnessDiviner.divine([divinerQuery])
              if (result && result.length > 0) {
                const response = result.find(isBoundWitness)
                if (response && (response as unknown as { $sourceQuery: string })?.$sourceQuery === sourceQuery) {
                  this.logger?.debug(`Found response to query: ${sourceQuery}`)
                  // Get any payloads associated with the response
                  const payloads: Payload[] = response.payload_hashes?.length > 0 ? await responseArchivist.get(response.payload_hashes) : []
                  this.queryCache.set(sourceQuery, [response, payloads, []])
                }
              }
            }
          }),
        )
      }
    }
  }

  private start() {
    if (this._pollCount === 0) {
      this.poll()
    }
    this._pollCount++
  }

  private stop() {
    this._pollCount--
    if (this._pollCount <= 0) {
      if (this._pollId) clearTimeoutEx(this._pollId)
      this._pollId = undefined
      this._pollCount = 0
    }
  }
}
