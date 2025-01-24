import type { ArchivistConfig } from '@xyo-network/archivist-model'

import { LevelDbArchivistSchema } from './Schema.ts'

export type LevelDbArchivistConfigSchema = `${LevelDbArchivistSchema}.config`
export const LevelDbArchivistConfigSchema: LevelDbArchivistConfigSchema = `${LevelDbArchivistSchema}.config`

export type LevelDbArchivistConfig<TStoreName extends string = string> = ArchivistConfig<{
  /**
   * The database name
   */
  dbName?: string
  location?: string
  schema: LevelDbArchivistConfigSchema
  /**
   * The name of the object store
   */
  storeName?: TStoreName
}>
