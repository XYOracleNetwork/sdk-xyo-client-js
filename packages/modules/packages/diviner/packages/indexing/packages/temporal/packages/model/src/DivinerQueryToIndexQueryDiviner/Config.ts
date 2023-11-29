import { DivinerConfig } from '@xyo-network/diviner-model'

import { StringToJsonPathTransformExpressionsDictionary } from '../jsonpath'
import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema } from './Schema'

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema =
  `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`
export const TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema = `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms a Diviner Query to an Index Query
 */
export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = DivinerConfig<{
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  /**
   * The transforms to apply to the source payloads
   */
  schemaTransforms?: StringToJsonPathTransformExpressionsDictionary
}>
