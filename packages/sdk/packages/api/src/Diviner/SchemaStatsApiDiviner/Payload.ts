import { XyoPayload } from '@xyo-network/payload-model'

export type SchemaStatsSchema = 'network.xyo.schema.stats'
export const SchemaStatsSchema: SchemaStatsSchema = 'network.xyo.schema.stats'

export type SchemaStats = XyoPayload<
  {
    counts: Record<string, number>
  },
  SchemaStatsSchema
>
