import { BoundWitnessDivinerPredicate } from '@xyo-network/diviner-boundwitness-model'
import { SearchableStorage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingDivinerStateToIndexCandidateDivinerSchema } from './Schema'

export type TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema = `${TemporalIndexingDivinerStateToIndexCandidateDivinerSchema}.config`
export const TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema: TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema = `${TemporalIndexingDivinerStateToIndexCandidateDivinerSchema}.config`

export type TemporalIndexingDivinerStateToIndexCandidateDivinerConfig = DivinerConfig<{
  /**
   * The filter to use to identify index candidates
   */
  filter: BoundWitnessDivinerPredicate
  payloadDivinerLimit?: number
  /**
   * Where the diviner should look for stored thumbnails
   */
  payloadStore?: SearchableStorage
  schema: TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema
}>
