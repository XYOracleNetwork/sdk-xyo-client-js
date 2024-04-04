import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Base, TypeCheck } from '@xylabs/object'
import { ArchivistInstance, isArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance, isDivinerInstance } from '@xyo-network/diviner-model'
import { ModuleConfig, ModuleIdentifier, ModuleInstance, traceModuleIdentifier } from '@xyo-network/module-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusParams } from './model'

export class AsyncQueryBusBase<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends Base<TParams> {
  protected _lastState?: LRUCache<Address, number>
  protected _targetConfigs: Record<Address, ModuleConfig> = {}
  protected _targetQueries: Record<Address, string[]> = {}

  private _lastResolveAttempt: Record<ModuleIdentifier, number> = {}
  private _queriesArchivist?: ArchivistInstance
  private _queriesDiviner?: DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, QueryBoundWitness>
  private _reResolveDelay = 1000 * 5 //5 seconds
  private _resolveMutex = new Mutex()
  private _responsesArchivist?: ArchivistInstance
  private _responsesDiviner?: DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>

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
    this._queriesArchivist =
      this._queriesArchivist ??
      (await this.resolve(
        assertEx(this.config?.intersect?.queries?.archivist, () => 'No queries Archivist defined'),
        isArchivistInstance,
      ))
    return this._queriesArchivist
  }

  async queriesDiviner() {
    this._queriesDiviner =
      this._queriesDiviner ??
      ((await this.resolve(
        assertEx(this.config?.intersect?.queries?.boundWitnessDiviner, () => 'No queries Diviner defined'),
        isDivinerInstance,
      )) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, QueryBoundWitness>)
    return this._queriesDiviner
  }

  async responsesArchivist() {
    this._responsesArchivist =
      this._responsesArchivist ??
      (await this.resolve(
        assertEx(this.config?.intersect?.responses?.archivist, () => 'No responses Archivist defined'),
        isArchivistInstance,
      ))
    return this._responsesArchivist
  }

  async responsesDiviner() {
    this._responsesDiviner =
      this._responsesDiviner ??
      ((await this.resolve(
        assertEx(this.config?.intersect?.responses?.boundWitnessDiviner, () => 'No responses Diviner defined'),
        isDivinerInstance,
      )) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>)
    return this._responsesDiviner
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

  private async resolve<T extends ModuleInstance>(id: ModuleIdentifier, typeCheck: TypeCheck<T>): Promise<T | undefined> {
    return (await this._resolveMutex.runExclusive(async () => {
      if (this._queriesArchivist) {
        return this._queriesArchivist
      }
      if (Date.now() - (this._lastResolveAttempt[id] ?? 0) < this._reResolveDelay) {
        return
      }
      this._lastResolveAttempt[id] = Date.now()
      const resolved = await this.resolver.resolve(id)
      if (resolved) {
        if (typeCheck(resolved)) {
          return resolved
        } else {
          this.logger?.warn(`Unable to resolve responsesDiviner as correct type [${id}][${resolved?.constructor?.name}]: ${resolved.id}`)
        }
      } else {
        this.logger?.log(`Unable to resolve queriesArchivist [${id}] [${await traceModuleIdentifier(this.resolver, id)}]`)
      }
    })) as T | undefined
  }
}
