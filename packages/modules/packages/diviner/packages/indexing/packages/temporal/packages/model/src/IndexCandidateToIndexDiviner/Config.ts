import type { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema } from './Schema.ts'

export const TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  = asSchema(`${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`, true)

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = typeof TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema

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
