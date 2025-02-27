import { assertEx } from '@xylabs/assert'
import { Address, Hex } from '@xylabs/hex'
import { Base, TypeCheck } from '@xylabs/object'
import { ArchivistInstance, isArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance, isDivinerInstance } from '@xyo-network/diviner-model'
import {
  ModuleConfig, ModuleIdentifier, ModuleInstance, ResolveHelper,
} from '@xyo-network/module-model'
import { SequenceConstants } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusParams } from './model/index.ts'

const POLLING_FREQUENCY_MIN = 100 as const
const POLLING_FREQUENCY_MAX = 60_000 as const
const POLLING_FREQUENCY_DEFAULT = 1000 as const

export class AsyncQueryBusBase<TParams extends AsyncQueryBusParams = AsyncQueryBusParams> extends Base<TParams> {
  protected _lastState?: LRUCache<Address, Hex>
  protected _targetConfigs: Record<Address, ModuleConfig> = {}
  protected _targetQueries: Record<Address, string[]> = {}

  private _lastResolveFailure: Record<ModuleIdentifier, number> = {}
  private _queriesArchivist?: ArchivistInstance
  private _queriesDiviner?: DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, QueryBoundWitness>
  private _reResolveDelay = 1000 * 5 // 5 seconds
  private _resolveMutex = new Mutex()
  private _responsesArchivist?: ArchivistInstance
  private _responsesDiviner?: DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>

  constructor(params: TParams) {
    super(params)
  }

  get config(): TParams['config'] {
    return this.params.config
  }

  get pollFrequency(): number {
    const frequency = this.config?.pollFrequency ?? POLLING_FREQUENCY_DEFAULT
    if (frequency < POLLING_FREQUENCY_MIN || frequency > POLLING_FREQUENCY_MAX) {
      return POLLING_FREQUENCY_DEFAULT
    }
    return frequency
  }

  get rootModule() {
    return this.params.rootModule
  }

  /**
   * A cache of the last offset of the Diviner process per address
   */
  protected get lastState(): LRUCache<Address, Hex> {
    const requiredConfig = { max: 1000, ttl: 0 }
    this._lastState = this._lastState ?? new LRUCache<Address, Hex>(requiredConfig)
    return this._lastState
  }

  async queriesArchivist() {
    return await this._resolveMutex.runExclusive(async () => {
      this._queriesArchivist
        = this._queriesArchivist
          ?? (await this.resolve(
            assertEx(this.config?.intersect?.queries?.archivist, () => 'No queries Archivist defined'),
            isArchivistInstance,
          ))
      return this._queriesArchivist
    })
  }

  async queriesDiviner() {
    return await this._resolveMutex.runExclusive(async () => {
      this._queriesDiviner
        = this._queriesDiviner
          ?? ((await this.resolve(
            assertEx(this.config?.intersect?.queries?.boundWitnessDiviner, () => 'No queries Diviner defined'),
            isDivinerInstance,
          )) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, QueryBoundWitness>)
      return this._queriesDiviner
    })
  }

  async responsesArchivist() {
    return await this._resolveMutex.runExclusive(async () => {
      this._responsesArchivist
        = this._responsesArchivist
          ?? (await this.resolve(
            assertEx(this.config?.intersect?.responses?.archivist, () => 'No responses Archivist defined'),
            isArchivistInstance,
          ))
      return this._responsesArchivist
    })
  }

  async responsesDiviner() {
    return await this._resolveMutex.runExclusive(async () => {
      this._responsesDiviner
        = this._responsesDiviner
          ?? ((await this.resolve(
            assertEx(this.config?.intersect?.responses?.boundWitnessDiviner, () => 'No responses Diviner defined'),
            isDivinerInstance,
          )) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>)
      return this._responsesDiviner
    })
  }

  /**
   * Commit the internal state of the process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param address The module address to commit the state for
   * @param nextState The state to commit
   */
  protected async commitState(address: Address, nextState: Hex) {
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
  protected async retrieveState(address: Address): Promise<Hex> {
    await Promise.resolve()
    const state = this.lastState.get(address)
    if (state === undefined) {
      const newState = SequenceConstants.minLocalSequence
      this.lastState.set(address, newState)
      return newState
    } else {
      return state
    }
  }

  private async resolve<T extends ModuleInstance>(id: ModuleIdentifier, typeCheck: TypeCheck<T>): Promise<T | undefined> {
    if (Date.now() - (this._lastResolveFailure[id] ?? 0) < this._reResolveDelay) {
      return
    }
    this._lastResolveFailure[id] = Date.now()
    const resolved = await ResolveHelper.resolveModuleIdentifier(this.rootModule, id)
    if (resolved) {
      if (typeCheck(resolved)) {
        delete this._lastResolveFailure[id]
        return resolved
      } else {
        this.logger?.warn(`Unable to resolve responsesDiviner as correct type [${id}][${resolved?.constructor?.name}]: ${resolved.id}`)
      }
    } else {
      this.logger?.debug(`Unable to resolve queriesArchivist [${id}] [${await ResolveHelper.traceModuleIdentifier(this.rootModule, id)}]`)
    }
  }
}
