import { BoundWitnessDivinerPredicate } from '@xyo-network/diviner-boundwitness-model'
import { SearchableStorage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingDivinerStateToIndexCandidateDivinerSchema } from './Schema'

export type TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema = `${TemporalIndexingDivinerStateToIndexCandidateDivinerSchema}.config`
export const TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema: TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema = `${TemporalIndexingDivinerStateToIndexCandidateDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms a Diviner State to Index Candidates
 */
export type TemporalIndexingDivinerStateToIndexCandidateDivinerConfig = DivinerConfig<{
  /**
   * The filter to use to identify index candidates
   */
  filter?: BoundWitnessDivinerPredicate
  /**
   * The maximum number of payloads to index at a time
   */
  payloadDivinerLimit?: number
  /**
   * Where the diviner should look for stored thumbnails
   */
  payloadStore?: SearchableStorage
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema
}>
