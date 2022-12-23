import { DivinerConfig } from '@xyo-network/diviner-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type XyoSchemaStatsApiDivinerConfigSchema = 'network.xyo.diviner.schema.stats.api.config'
export const XyoSchemaStatsApiDivinerConfigSchema: XyoSchemaStatsApiDivinerConfigSchema = 'network.xyo.diviner.schema.stats.api.config'

export type XyoSchemaStatsApiDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  XyoPayload,
  T & {
    archive: string
    schema: XyoSchemaStatsApiDivinerConfigSchema
  }
>
