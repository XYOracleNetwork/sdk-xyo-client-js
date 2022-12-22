import { DivinerConfig } from '@xyo-network/diviner-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const XyoArchivistPayloadDivinerConfigSchema: XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type XyoArchivistPayloadDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  XyoPayload,
  T & {
    archivist?: string
    schema: XyoArchivistPayloadDivinerConfigSchema
  }
>
