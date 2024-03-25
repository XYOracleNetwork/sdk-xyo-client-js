import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Base, toJsonString } from '@xylabs/object'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance, DivinerInstance } from '@xyo-network/diviner-model'
import { ModuleConfig } from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusParams } from './model'

export class AsyncQueryBusBase<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends Base<TParams> {
  protected _lastState?: LRUCache<Address, number>
  protected _targetConfigs: Record<Address, ModuleConfig> = {}
  protected _targetQueries: Record<Address, string[]> = {}

  constructor(params: TParams) {
    super(params)
  }

  get config(): TParams['config'] {
    return this.params.config
  }

  get pollFrequencyConfig(): number {
    return this.config?.pollFrequency ?? 1000
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

  async queriesArchivist() {
    const resolved = await this.resolver.resolve(this.config?.intersect?.queries?.archivist, { direction: 'up' })
    const existingResolved = assertEx(resolved, () => `Unable to resolve queriesArchivist [${this.config?.intersect?.queries?.archivist}]`)
    const result = asArchivistInstance(
      existingResolved,
      () =>
        `Unable to resolve queriesArchivist as correct type [${this.config?.intersect?.queries?.archivist}][${existingResolved?.constructor?.name}]: ${toJsonString(existingResolved)}`,
    )
    return result
  }

  async queriesDiviner() {
    return assertEx(
      asDivinerInstance(await this.resolver.resolve(this.config?.intersect?.queries?.boundWitnessDiviner)),
      () => `Unable to resolve queriesDiviner [${this.config?.intersect?.queries?.boundWitnessDiviner}]`,
    ) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, QueryBoundWitness>
  }

  async responsesArchivist() {
    return assertEx(
      asArchivistInstance(await this.resolver.resolve(this.config?.intersect?.responses?.archivist)),
      () => `Unable to resolve responsesArchivist [${this.config?.intersect?.responses?.archivist}]`,
    )
  }

  async responsesDiviner() {
    return assertEx(
      asDivinerInstance(await this.resolver.resolve(this.config?.intersect?.responses?.boundWitnessDiviner)),
      () => `Unable to resolve responsesDiviner [${this.config?.intersect?.responses?.boundWitnessDiviner}]`,
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
