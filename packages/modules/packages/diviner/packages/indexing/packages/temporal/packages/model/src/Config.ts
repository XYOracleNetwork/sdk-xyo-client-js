import { SearchableStorage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingDivinerSchema } from './Schema'

export const TemporalIndexingDivinerConfigSchema = `${TemporalIndexingDivinerSchema}.config` as const
export type TemporalIndexingDivinerConfigSchema = typeof TemporalIndexingDivinerConfigSchema

// TODO: Extend indexing diviner config and just remove fields that are not needed?
export type TemporalIndexingDivinerConfig = DivinerConfig<{
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
  schema: TemporalIndexingDivinerConfigSchema
  /**
   * Where the diviner should persist its internal state
   */
  stateStore?: SearchableStorage
}>
