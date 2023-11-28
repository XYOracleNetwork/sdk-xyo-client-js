import { DivinerConfig } from '@xyo-network/diviner-model'

import { StringToJsonPathTransformExpressionsDictionary } from '../jsonpath'
import { TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema } from './Schema'

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = `${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`
export const TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema = `${TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema}.config`

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig = DivinerConfig<{
  schema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  schemaTransforms: StringToJsonPathTransformExpressionsDictionary
}>
