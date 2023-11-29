import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerSchema } from './Schema'

export type TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema =
  `${TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerSchema}.config`
export const TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema: TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema = `${TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerSchema}.config`

/**
 * Diviner Config for a Diviner which transforms an Index Query Response to a Diviner Query Response
 */
export type TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfig = DivinerConfig<{
  /**
   * The config schema
   */
  schema: TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
}>
