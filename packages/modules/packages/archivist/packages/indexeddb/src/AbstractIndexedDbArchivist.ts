import { AbstractDirectArchivist } from '@xyo-network/abstract-archivist'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'

export type AbstractIndexedDbArchivistConfigSchema = 'network.xyo.archivist.indexeddb.config'
export const AbstractIndexedDbArchivistConfigSchema: AbstractIndexedDbArchivistConfigSchema = 'network.xyo.archivist.indexeddb.config'

export type AbstractIndexedDbArchivistConfig = ArchivistConfig<{
  /**
   * The database name
   */
  dbName?: string
  schema: AbstractIndexedDbArchivistConfigSchema
  /**
   * The name of the object store
   */
  storeName?: string
}>

export type AbstractIndexedDbArchivistParams = ArchivistParams<AnyConfigSchema<AbstractIndexedDbArchivistConfig>>

export abstract class AbstractIndexedDbArchivist<
  TParams extends AbstractIndexedDbArchivistParams = AbstractIndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractDirectArchivist<TParams, TEventData> {
  static override configSchemas = [AbstractIndexedDbArchivistConfigSchema]
  static defaultDbName = 'archivist'
  static defaultStoreName = 'payloads'

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistClearQuerySchema, ArchivistDeleteQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }

  /**
   * The database name.
   */
  abstract get dbName(): string

  /**
   * The name of the object store.
   */
  abstract get storeName(): string
}
