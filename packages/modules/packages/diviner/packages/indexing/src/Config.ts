import { DivinerConfig } from '@xyo-network/diviner-model'

import { IndexingDivinerSchema } from './Schema'
import { SearchableStorage } from './SearchableStorage'

export const IndexingDivinerConfigSchema = `${IndexingDivinerSchema}.config` as const
export type IndexingDivinerConfigSchema = typeof IndexingDivinerConfigSchema

export type IndexingDivinerConfig = DivinerConfig<{
  /**
   * Where the diviner should store it's index
   */
  indexStore?: SearchableStorage
  /**
   * The maximum number of payloads to index at a time
   */
  payloadDivinerLimit?: number
  /**
   * How often to poll for new payloads to index
   */
  pollFrequency?: number
  /**
   * The schema for the Diviner config
   */
  schema: IndexingDivinerConfigSchema
  /**
   * Where the diviner should persist its internal state
   */
  stateStore?: SearchableStorage
}>
