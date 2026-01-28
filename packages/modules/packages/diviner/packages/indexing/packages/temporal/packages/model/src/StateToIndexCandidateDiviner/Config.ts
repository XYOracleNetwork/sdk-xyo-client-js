import type { BoundWitnessDivinerPredicate } from '@xyo-network/diviner-boundwitness-model'
import type { DivinerConfig, SearchableStorage } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerStateToIndexCandidateDivinerSchema } from './Schema.ts'

export const TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema
  = asSchema(`${TemporalIndexingDivinerStateToIndexCandidateDivinerSchema}.config`, true)

export type TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema = typeof TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema

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
