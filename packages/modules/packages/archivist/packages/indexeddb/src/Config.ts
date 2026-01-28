import type { ArchivistConfig } from '@xyo-network/archivist-model'
import { asSchema } from '@xyo-network/payload-model'

import { IndexedDbArchivistSchema } from './Schema.ts'

export const IndexedDbArchivistConfigSchema = asSchema(`${IndexedDbArchivistSchema}.config`, true)
export type IndexedDbArchivistConfigSchema = typeof IndexedDbArchivistConfigSchema

export type IndexedDbArchivistConfig<TStoreName extends string = string> = ArchivistConfig<{
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
   * The name of the object store
   */
  storeName?: TStoreName
}>
