import { DivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload-model'

export type XyoSchemaListApiDivinerConfigSchema = 'network.xyo.diviner.schema.list.api.config'
export const XyoSchemaListApiDivinerConfigSchema: XyoSchemaListApiDivinerConfigSchema = 'network.xyo.diviner.schema.list.api.config'

export type XyoSchemaListApiDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  XyoPayload,
  T & {
    archive: string
    schema: XyoSchemaListApiDivinerConfigSchema
  }
>
