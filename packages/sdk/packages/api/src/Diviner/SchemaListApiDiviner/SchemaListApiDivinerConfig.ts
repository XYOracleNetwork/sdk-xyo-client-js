import { XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

export type XyoSchemaListApiDivinerConfigSchema = 'network.xyo.diviner.schema.list.api.config'
export const XyoSchemaListApiDivinerConfigSchema: XyoSchemaListApiDivinerConfigSchema = 'network.xyo.diviner.schema.list.api.config'

export type XyoSchemaListApiDivinerConfig<T extends XyoPayload = XyoPayload> = XyoDivinerConfig<
  XyoPayload,
  T & {
    archive: string
    schema: XyoSchemaListApiDivinerConfigSchema
  }
>
