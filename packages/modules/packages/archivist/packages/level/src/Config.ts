import { ArchivistConfig } from '@xyo-network/archivist-model'

import { LevelDbArchivistSchema } from './Schema.ts'

export type LevelDbArchivistConfigSchema = `${LevelDbArchivistSchema}.config`
export const LevelDbArchivistConfigSchema: LevelDbArchivistConfigSchema = `${LevelDbArchivistSchema}.config`

export type LevelDbArchivistConfig<TStoreName extends string = string> = ArchivistConfig<{
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
  schema: LevelDbArchivistConfigSchema
  /**
   * The name of the object store - becomes a sub-level
   */
  storeName?: TStoreName
}>
