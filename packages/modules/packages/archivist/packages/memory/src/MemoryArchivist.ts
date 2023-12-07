import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { fulfilled, Promisable, PromisableArray } from '@xylabs/promise'
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
import { PayloadHasher } from '@xyo-network/hash'
import { AnyConfigSchema, creatableModule, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { LRUCache } from 'lru-cache'

export type MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'
export const MemoryArchivistConfigSchema: MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'

export type MemoryArchivistConfig = ArchivistConfig<{
  max?: number
  schema: MemoryArchivistConfigSchema | ArchivistConfig['schema']
}>

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

  private _cache?: LRUCache<string, Payload>

  get cache() {
    this._cache = this._cache ?? new LRUCache<string, Payload>({ max: this.max })
    return this._cache
  }

  get max() {
    return this.config?.max ?? 10000
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

  protected override allHandler(): PromisableArray<Payload> {
    return compact(this.cache.dump().map((value) => PayloadHasher.hashFields(value[1].value)))
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    return this.emit('cleared', { module: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
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

  protected override async deleteHandler(hashes: string[]): Promise<string[]> {
    const payloadPairs: [string, Payload][] = await Promise.all(
      (await this.get(hashes)).map<Promise<[string, Payload]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
    )
    const deletedPairs: [string, Payload][] = compact(
      await Promise.all(
        payloadPairs.map<[string, Payload] | undefined>(([hash, payload]) => {
          return this.cache.delete(hash) ? [hash, payload] : undefined
        }),
      ),
    )
    return deletedPairs.map(([hash]) => hash)
  }

  protected override getHandler(hashes: string[]): Promisable<Payload[]> {
    return compact(hashes.map((hash) => this.cache.get(hash)))
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const insertedPayloads = await Promise.all(
      payloads.map((payload) => {
        return this.insertPayloadIntoCache(payload)
      }),
    )

    return insertedPayloads
  }

  private async insertPayloadIntoCache(payload: Payload): Promise<Payload> {
    const wrapper = PayloadWrapper.wrap(payload)
    const payloadWithMeta = { ...PayloadHasher.hashFields(payload), _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
    this.cache.set(payloadWithMeta._hash, payloadWithMeta)
    return payload
  }
}
