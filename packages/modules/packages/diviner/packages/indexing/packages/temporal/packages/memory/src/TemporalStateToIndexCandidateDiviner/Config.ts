import { SearchableStorage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalStateToIndexCandidateDivinerSchema } from './Schema'

export type TemporalStateToIndexCandidateDivinerConfigSchema = `${TemporalStateToIndexCandidateDivinerSchema}.config`
export const TemporalStateToIndexCandidateDivinerConfigSchema: TemporalStateToIndexCandidateDivinerConfigSchema = `${TemporalStateToIndexCandidateDivinerSchema}.config`

export type TemporalStateToIndexCandidateDivinerConfig = DivinerConfig<{
  payloadDivinerLimit?: number
  /**
   * Where the diviner should look for stored thumbnails
   */
  payloadStore?: SearchableStorage
  schema: TemporalStateToIndexCandidateDivinerConfigSchema
}>
