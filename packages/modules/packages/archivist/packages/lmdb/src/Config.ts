import type { ArchivistConfig } from '@xyo-network/archivist-model'
import { asSchema } from '@xyo-network/payload-model'

import { LmdbArchivistSchema } from './Schema.ts'

export const LmdbArchivistConfigSchema = asSchema(`${LmdbArchivistSchema}.config`, true)
export type LmdbArchivistConfigSchema = typeof LmdbArchivistConfigSchema

export type LmdbArchivistConfig<TStoreName extends string = string> = ArchivistConfig<{
  /**
   * If true, the store will be cleared on start
   */
  clearStoreOnStart?: boolean
  /**
   * The database name - also used as the filename for the db
   */
  dbName?: string
  /**
   * The location where the folder for the db will be created
   */
  location?: string
  schema: LmdbArchivistConfigSchema
  /**
   * The name of the object store - becomes a sub-level
   */
  storeName?: TStoreName
}>
