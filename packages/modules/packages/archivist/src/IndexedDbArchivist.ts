import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import { ArchivistConfig, ArchivistInsertQuerySchema, ArchivistModuleEventData, ArchivistParams } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { entries, getMany, setMany, UseStore } from 'idb-keyval'

export type IndexedDbArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'
export const IndexedDbArchivistConfigSchema: IndexedDbArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'

export type IndexedDbArchivistConfig = ArchivistConfig<{
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  schema: IndexedDbArchivistConfigSchema
}>

export type IndexedDbArchivistParams = ArchivistParams<
  AnyConfigSchema<IndexedDbArchivistConfig>,
  {
    IndexedDb?: UseStore
  }
>

@creatableModule()
export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchema = IndexedDbArchivistConfigSchema

  override async all(): Promise<Payload[]> {
    const result = await entries<string, Payload>(this.params.IndexedDb ?? undefined)
    return result.map<Payload>(([_hash, payload]) => payload)
  }

  override async get(hashes: string[]): Promise<Payload[]> {
    const result = await getMany<Payload>(hashes, this.params.IndexedDb ?? undefined)
    return result
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const entries = await Promise.all(
      payloads.map<Promise<[string, Payload]>>(async (payload) => {
        const hash = await PayloadHasher.hashAsync(payload)
        return [hash, payload]
      }),
    )
    await setMany(entries, this.params.IndexedDb ?? undefined)
    const result = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, payloads)
    return [result[0]]
  }
}
