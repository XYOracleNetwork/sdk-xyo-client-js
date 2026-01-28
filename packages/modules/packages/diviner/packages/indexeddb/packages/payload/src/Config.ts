import type { IndexDescription } from '@xyo-network/archivist-model'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import { IndexedDbPayloadDivinerSchema } from './Schema.ts'

export const IndexedDbPayloadDivinerConfigSchema = asSchema(`${IndexedDbPayloadDivinerSchema}.config`, true)
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
