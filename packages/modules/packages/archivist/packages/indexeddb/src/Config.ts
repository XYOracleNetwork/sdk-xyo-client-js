import { ArchivistConfig, IndexDescription } from '@xyo-network/archivist-model'

import { IndexedDbArchivistSchema } from './Schema'

export type IndexedDbArchivistConfigSchema = `${IndexedDbArchivistSchema}.config`
export const IndexedDbArchivistConfigSchema: IndexedDbArchivistConfigSchema = `${IndexedDbArchivistSchema}.config`

export type IndexedDbArchivistConfig = ArchivistConfig<{
  /**
   * The database name
   */
  dbName?: string
  /**
   * The version of the DB, defaults to 1
   */
  dbVersion?: number
  schema: IndexedDbArchivistConfigSchema
  /**
   * The storage configuration
   * // TODO: Hoist to main archivist config
   */
  storage?: {
    /**
     * The indexes to create on the object store
     */
    indexes?: IndexDescription[]
  }
  /**
   * The name of the object store
   */
  storeName?: string
}>
