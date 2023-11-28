import { DivinerConfig } from '@xyo-network/diviner-model'

import { StringToJsonPathTransformExpressionsDictionary } from '../jsonpath'
import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema } from './Schema'

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema =
  `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`
export const TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema = `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = DivinerConfig<{
  schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  schemaTransforms: StringToJsonPathTransformExpressionsDictionary
}>
