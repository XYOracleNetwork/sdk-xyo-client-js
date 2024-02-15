import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { fulfilled, Promisable } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistConfigSchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  ArchivistModuleEventData,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, creatableModule, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

export type MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'
export const MemoryArchivistConfigSchema: MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'

export type MemoryArchivistConfig = ArchivistConfig<{
  max?: number
  schema: MemoryArchivistConfigSchema | ArchivistConfig['schema']
}>

type WithStorageMeta<T extends Payload> = T & {
  _sequence: bigint
}

const maxSequenceIndex = 10_000_000_000n

const sequenceNumber = (index: number) => {
  assertEx(index < maxSequenceIndex, () => `index may not be larger than ${maxSequenceIndex}`)
  return BigInt(Date.now()) * maxSequenceIndex + BigInt(index)
}

const addStorageMeta = <T extends PayloadWithMeta>(payload: T, index = 0) => {
  return { ...payload, _sequence: sequenceNumber(index) } as WithStorageMeta<T>
}

const sortByStorageMeta = <T extends PayloadWithMeta>(payloads: WithStorageMeta<T>[]) => {
  return payloads.sort((a, b) => (a._sequence < b._sequence ? -1 : a._sequence > b._sequence ? 1 : 0))
}

function removeStorageMeta<T extends PayloadWithMeta>(payload: WithStorageMeta<T>): T
function removeStorageMeta<T extends PayloadWithMeta>(payload?: WithStorageMeta<T>): T | undefined
function removeStorageMeta<T extends PayloadWithMeta>(payload?: WithStorageMeta<T>) {
  if (!payload) return
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _sequence, ...noMeta } = payload as WithStorageMeta<T>
  return noMeta as T
}

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>> =
  ModuleParams<TConfig>
@creatableModule()
export class MemoryArchivist<
    TParams extends MemoryArchivistParams<AnyConfigSchema<MemoryArchivistConfig>> = MemoryArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractArchivist<TParams, TEventData>
  implements ArchivistInstance, ModuleInstance
{
  static override configSchemas = [MemoryArchivistConfigSchema, ArchivistConfigSchema]

  private _bodyHashIndex?: LRUCache<string, string>
  private _cache?: LRUCache<string, WithStorageMeta<PayloadWithMeta>>

  get bodyHashIndex() {
    this._bodyHashIndex = this._bodyHashIndex ?? new LRUCache<string, string>({ max: this.max })
    return this._bodyHashIndex
  }

  get cache() {
    this._cache = this._cache ?? new LRUCache<string, WithStorageMeta<PayloadWithMeta>>({ max: this.max })
    return this._cache
  }

  get max() {
    return this.config?.max ?? 10_000
  }

  override get queries() {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ...super.queries,
    ]
  }

  protected override async allHandler(): Promise<PayloadWithMeta[]> {
    const all = compact(await Promise.all(this.cache.dump().map((value) => value[1].value)))
    return sortByStorageMeta(all).map((payload) => removeStorageMeta(payload))
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    this.bodyHashIndex.clear()
    return this.emit('cleared', { module: this })
  }

  protected override async commitHandler(): Promise<WithMeta<BoundWitness>[]> {
    const payloads = assertEx(await this.allHandler(), 'Nothing to commit')
    const settled = await Promise.allSettled(
      compact(
        Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
          const queryPayload: ArchivistInsertQuery = {
            schema: ArchivistInsertQuerySchema,
          }
          const query = await this.bindQuery(queryPayload, payloads)
          return (await parent?.query(query[0], query[1]))?.[0]
        }),
      ),
    )
    await this.clearHandler()
    return compact(settled.filter(fulfilled).map((result) => result.value))
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<string[]> {
    const deletedHashes = compact(
      await Promise.all(
        hashes.map((hash) => {
          return this.cache.delete(hash) ? hash : undefined
        }),
      ),
    )
    return deletedHashes
  }

  protected override getHandler(hashes: string[]): Promisable<PayloadWithMeta[]> {
    return compact(
      hashes.map((hash) => {
        const resolvedHash = this.bodyHashIndex.get(hash) ?? hash
        const result = this.cache.get(resolvedHash)
        if (resolvedHash !== hash && !result) {
          throw new Error('Missing referenced payload')
        }
        return removeStorageMeta(result)
      }),
    )
  }

  protected override async insertHandler(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const pairs = await PayloadBuilder.hashPairs(payloads)
    const insertedPayloads = await Promise.all(
      pairs.map(([payload, hash]) => {
        return this.insertPayloadIntoCache(payload, hash)
      }),
    )

    return insertedPayloads
  }

  private insertPayloadIntoCache(payload: PayloadWithMeta, hash: string, index = 0): PayloadWithMeta {
    const withMeta = addStorageMeta(payload, index)
    this.cache.set(hash, withMeta)
    this.bodyHashIndex.set(withMeta.$hash, hash)
    return payload
  }
}
