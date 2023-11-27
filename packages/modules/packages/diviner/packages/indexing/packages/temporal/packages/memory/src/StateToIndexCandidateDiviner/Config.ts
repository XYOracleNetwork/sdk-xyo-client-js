import { BoundWitnessDivinerPredicate } from '@xyo-network/diviner-boundwitness-model'
import { SearchableStorage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingStateToIndexCandidateDivinerSchema } from './Schema'

export type TemporalIndexingStateToIndexCandidateDivinerConfigSchema = `${TemporalIndexingStateToIndexCandidateDivinerSchema}.config`
export const TemporalIndexingStateToIndexCandidateDivinerConfigSchema: TemporalIndexingStateToIndexCandidateDivinerConfigSchema = `${TemporalIndexingStateToIndexCandidateDivinerSchema}.config`

export type TemporalIndexingStateToIndexCandidateDivinerConfig = DivinerConfig<{
  /**
   * The filter to use to identify index candidates
   */
  filter: BoundWitnessDivinerPredicate
  payloadDivinerLimit?: number
  /**
   * Where the diviner should look for stored thumbnails
   */
  payloadStore?: SearchableStorage
  schema: TemporalIndexingStateToIndexCandidateDivinerConfigSchema
}>
