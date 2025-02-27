import { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { Schema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema } from './Schema.ts'

export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema =
  `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`
export const TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
= `${TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms a Diviner Query to an Index Query
 */
export type TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = DivinerConfig<{
  /**
   * The schema of the diviner query payloads
   */
  divinerQuerySchema?: Schema
  /**
   * The schema of the index query payloads
   */
  indexQuerySchema?: Schema
  /**
   * The schema of the index payloads
   */
  indexSchema?: Schema
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  /**
   * The transforms to apply to the source payloads
   */
  schemaTransforms?: SchemaToJsonPathTransformExpressionsDictionary
}>
