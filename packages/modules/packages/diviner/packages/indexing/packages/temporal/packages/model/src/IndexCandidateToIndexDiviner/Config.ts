import type { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import type { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema } from './Schema.ts'

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = `${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`
export const TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = `${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms Index Candidates to Indexes
 */
export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig = DivinerConfig<{
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  /**
   * The transforms to apply to the source payloads
   */
  schemaTransforms?: SchemaToJsonPathTransformExpressionsDictionary
}>
