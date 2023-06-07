import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import { ArchivistConfig, ArchivistInsertQuerySchema, ArchivistModuleEventData, ArchivistParams } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { setMany, UseStore } from 'idb-keyval'

export type IndexedDBArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'
export const IndexedDBArchivistConfigSchema: IndexedDBArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'

export type IndexedDBArchivistConfig = ArchivistConfig<{
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  schema: IndexedDBArchivistConfigSchema
}>

export type IndexedDBArchivistParams = ArchivistParams<
  AnyConfigSchema<IndexedDBArchivistConfig>,
  {
    indexedDB?: UseStore
  }
>

@creatableModule()
export class IndexedDBArchivist<
  TParams extends IndexedDBArchivistParams = IndexedDBArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchema = IndexedDBArchivistConfigSchema

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const entries = await Promise.all(
      payloads.map<Promise<[string, Payload]>>(async (payload) => {
        const hash = await PayloadHasher.hashAsync(payload)
        return [hash, payload]
      }),
    )
    await setMany(entries, this.params.indexedDB)
    const result = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, payloads)
    return [result[0]]
  }
}
