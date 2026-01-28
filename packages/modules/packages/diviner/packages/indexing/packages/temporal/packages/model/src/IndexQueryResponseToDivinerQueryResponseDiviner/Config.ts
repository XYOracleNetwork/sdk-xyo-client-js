import type { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerSchema } from './Schema.ts'

export const TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
  = asSchema(`${TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerSchema}.config`, true)

export type TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
  = typeof TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema

/**
 * Diviner Config for a Diviner which transforms an Index Query Response to a Diviner Query Response
 */
export type TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfig = DivinerConfig<{
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
  /**
   * The transforms to apply to the source payloads
   */
  schemaTransforms?: SchemaToJsonPathTransformExpressionsDictionary
}>
