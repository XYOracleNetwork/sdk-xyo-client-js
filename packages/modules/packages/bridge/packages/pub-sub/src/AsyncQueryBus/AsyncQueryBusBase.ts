import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Base } from '@xylabs/object'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { CacheConfig } from '@xyo-network/bridge-model'
import { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance, DivinerInstance } from '@xyo-network/diviner-model'
import { ModuleConfig, ModuleQueryResult } from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import { Pending } from './Config'
import { AsyncQueryBusParams } from './Params'

export class AsyncQueryBusBase<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends Base<TParams> {
  protected _lastState?: LRUCache<Address, number>
  protected _queryCache?: LRUCache<Address, Pending | ModuleQueryResult>
  protected _targetConfigs: Record<Address, ModuleConfig> = {}
  protected _targetQueries: Record<Address, string[]> = {}

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

  get queryCacheConfig(): LRUCache.Options<Address, Pending | ModuleQueryResult, unknown> {
    const queryCacheConfig: CacheConfig | undefined = this.config.queryCache === true ? {} : this.config.queryCache
    return { max: 100, ttl: 1000 * 60, ...queryCacheConfig }
  }

  get resolver() {
    return this.params.resolver
  }

  /**
   * A cache of the last offset of the Diviner process per address
   */
  protected get lastState(): LRUCache<Address, number> {
    const requiredConfig = { max: 1000, ttl: 0 }
    this._lastState = this._lastState ?? new LRUCache<Address, number>(requiredConfig)
    return this._lastState
  }

  /**
   * A cache of queries that have been issued
   */
  protected get queryCache(): LRUCache<Address, Pending | ModuleQueryResult> {
    const config = this.queryCacheConfig
    const requiredConfig = { noUpdateTTL: false, ttlAutopurge: true }
    this._queryCache = this._queryCache ?? new LRUCache<Address, Pending | ModuleQueryResult>({ ...config, ...requiredConfig })
    return this._queryCache
  }

  async queriesArchivist() {
    return assertEx(
      asArchivistInstance(await this.resolver.resolve(this.config.queries?.archivist)),
      () => `Unable to resolve queriesArchivist [${this.config.queries?.archivist}]`,
    )
  }

  async queriesDiviner() {
    return assertEx(
      asDivinerInstance(await this.resolver.resolve(this.config.queries?.boundWitnessDiviner)),
      () => `Unable to resolve queriesDiviner [${this.config.queries?.boundWitnessDiviner}]`,
    ) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, QueryBoundWitness>
  }

  async responsesArchivist() {
    return assertEx(
      asArchivistInstance(await this.resolver.resolve(this.config.responses?.archivist)),
      () => `Unable to resolve responsesArchivist [${this.config.responses?.archivist}]`,
    )
  }

  async responsesDiviner() {
    return assertEx(
      asDivinerInstance(await this.resolver.resolve(this.config.responses?.boundWitnessDiviner)),
      () => `Unable to resolve responsesDiviner [${this.config.responses?.boundWitnessDiviner}]`,
    ) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>
  }

  /**
   * Commit the internal state of the process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param address The module address to commit the state for
   * @param nextState The state to commit
   */
  protected async commitState(address: Address, nextState: number) {
    await Promise.resolve()
    // TODO: Offload to Archivist/Diviner instead of in-memory
    const lastState = this.lastState.get(address)
    if (lastState && lastState >= nextState) return
    this.lastState.set(address, nextState)
  }

  /**
   * Retrieves the last state of the process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(address: Address): Promise<number> {
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
}
