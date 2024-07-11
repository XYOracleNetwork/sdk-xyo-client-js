import { IndexDescription } from '@xyo-network/archivist-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { IndexedDbPayloadDivinerSchema } from './Schema.js'

export const IndexedDbPayloadDivinerConfigSchema = `${IndexedDbPayloadDivinerSchema}.config` as const
export type IndexedDbPayloadDivinerConfigSchema = typeof IndexedDbPayloadDivinerConfigSchema

export type IndexedDbPayloadDivinerConfig = DivinerConfig<{
  /**
   * The database name
   */
  dbName?: string
  /**
   * The version of the DB, defaults to 1
   */
  dbVersion?: number
  schema: IndexedDbPayloadDivinerConfigSchema
  /**
   * The storage configuration
   * // TODO: Hoist to main diviner config
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
