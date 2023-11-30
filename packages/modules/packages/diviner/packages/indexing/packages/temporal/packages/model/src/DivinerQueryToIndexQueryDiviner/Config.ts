import { DivinerConfig } from '@xyo-network/diviner-model'

import { SchemaToJsonPathTransformExpressionsDictionary } from '../jsonpath'
import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema } from './Schema'

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema =
  `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`
export const TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema = `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms a Diviner Query to an Index Query
 */
export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = DivinerConfig<{
  /**
   * The schema of the diviner query payloads
   */
  divinerQuerySchema: string
  /**
   * The schema of the index query payloads
   */
  indexQuerySchema: string
  /**
   * The schema of the index payloads
   */
  indexSchema: string
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  /**
   * The transforms to apply to the source payloads
   */
  schemaTransforms?: SchemaToJsonPathTransformExpressionsDictionary
}>
