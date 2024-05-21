import { IndexDescription } from '@xyo-network/archivist-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { IndexedDbBoundWitnessDivinerSchema } from './Schema'

export const IndexedDbBoundWitnessDivinerConfigSchema = `${IndexedDbBoundWitnessDivinerSchema}.config` as const
export type IndexedDbBoundWitnessDivinerConfigSchema = typeof IndexedDbBoundWitnessDivinerConfigSchema

export type IndexedDbBoundWitnessDivinerConfig = DivinerConfig<{
  /**
   * The database name
   */
  dbName?: string
  /**
   * The version of the DB, defaults to 1
   */
  dbVersion?: number
  schema: IndexedDbBoundWitnessDivinerConfigSchema
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
