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
  payloadDivinerLimit?: number
  pollFrequency?: number
  schema: IndexingDivinerConfigSchema
  /**
   * Where the diviner should persist its internal state
   */
  stateStore?: SearchableStorage
}>
