import { DivinerConfig } from '@xyo-network/diviner-model'
import { StringToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-temporal-indexing-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema } from './Schema'

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema =
  `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`
export const TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema = `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = DivinerConfig<{
  schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  schemaTransforms: StringToJsonPathTransformExpressionsDictionary
}>
