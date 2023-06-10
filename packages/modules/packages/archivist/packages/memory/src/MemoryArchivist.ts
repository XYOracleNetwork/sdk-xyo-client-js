import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, creatableModule, ModuleParams } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'
import { LRUCache } from 'lru-cache'

export type MemoryArchivistConfigSchema = 'network.xyo.module.config.archivist.memory'
export const MemoryArchivistConfigSchema: MemoryArchivistConfigSchema = 'network.xyo.module.config.archivist.memory'

export type MemoryArchivistConfig = ArchivistConfig<{
  max?: number
  schema: MemoryArchivistConfigSchema
}>

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>> =
  ModuleParams<TConfig>
@creatableModule()
export class MemoryArchivist<
  TParams extends MemoryArchivistParams<AnyConfigSchema<MemoryArchivistConfig>> = MemoryArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchema = MemoryArchivistConfigSchema

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

  override all(): PromisableArray<Payload> {
    return compact(this.cache.dump().map((value) => value[1].value))
  }

  override clear(): void | Promise<void> {
    this.cache.clear()
    return this.emit('cleared', { module: this })
  }

  override async commit(): Promise<BoundWitness[]> {
    const payloads = assertEx(await this.all(), 'Nothing to commit')
    const settled = await Promise.allSettled(
      compact(
        Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
          const queryPayload = PayloadWrapper.parse<ArchivistInsertQuery>({
            payloads: await Promise.all(payloads.map((payload) => PayloadWrapper.hashAsync(payload))),
            schema: ArchivistInsertQuerySchema,
          })
          const query = await this.bindQuery(queryPayload, payloads)
          return (await parent?.query(query[0], query[1]))?.[0]
        }),
      ),
    )
    await this.clear()
    return compact(settled.filter(fulfilled).map((result) => result.value))
  }

  override async delete(hashes: string[]): Promise<boolean[]> {
    const found = hashes.map((hash) => {
      return this.cache.delete(hash)
    })
    await this.emit('deleted', { found, hashes, module: this })
    return found
  }

  override async get(hashes: string[]): Promise<Payload[]> {
    return compact(
      await Promise.all(
        hashes.map(async (hash) => {
          const payload = this.cache.get(hash) ?? (await super.get([hash]))[0] ?? null
          if (this.storeParentReads) {
            // NOTE: `payload` can actually be `null` here but TS doesn't seem
            // to recognize it. LRUCache claims not to support `null`s via their
            // types but seems to under the hood just fine.
            this.cache.set(hash, payload)
          }
          return payload
        }),
      ),
    )
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    await Promise.all(
      payloads.map((payload) => {
        return this.insertPayloadIntoCache(payload)
      }),
    )

    const result = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, payloads)
    const parentBoundWitnesses: BoundWitness[] = []
    const parents = await this.parents()
    if (Object.entries(parents.write ?? {}).length) {
      // We store the child bw also
      parentBoundWitnesses.push(...(await this.writeToParents([result[0], ...payloads])))
    }
    const boundWitnesses = [result[0], ...parentBoundWitnesses]
    await this.emit('inserted', { boundWitnesses, module: this })
    return boundWitnesses
  }

  private async insertPayloadIntoCache(payload: Payload): Promise<Payload> {
    const wrapper = new PayloadWrapper(payload)
    const payloadWithMeta = { ...payload, _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
    this.cache.set(payloadWithMeta._hash, payloadWithMeta)
    return payloadWithMeta
  }
}
