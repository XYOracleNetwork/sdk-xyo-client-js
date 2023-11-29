import { DivinerConfig } from '@xyo-network/diviner-model'

import { StringToJsonPathTransformExpressionsDictionary } from '../jsonpath'
import { TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema } from './Schema'

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = `${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`
export const TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = `${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms an Index Candidate to an Index
 */
export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig = DivinerConfig<{
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  /**
   * The transforms to apply to the source payloads
   */
  schemaTransforms?: StringToJsonPathTransformExpressionsDictionary
}>
