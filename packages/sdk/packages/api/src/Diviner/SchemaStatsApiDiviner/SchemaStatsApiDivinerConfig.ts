import { XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

export type XyoSchemaStatsApiDivinerConfigSchema = 'network.xyo.diviner.schema.stats.api.config'
export const XyoSchemaStatsApiDivinerConfigSchema: XyoSchemaStatsApiDivinerConfigSchema = 'network.xyo.diviner.schema.stats.api.config'

export type XyoSchemaStatsApiDivinerConfig<T extends XyoPayload = XyoPayload> = XyoDivinerConfig<
  XyoPayload,
  T & {
    archive: string
    schema: XyoSchemaStatsApiDivinerConfigSchema
  }
>
