import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../../Config'

export type XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const XyoArchivistPayloadDivinerConfigSchema: XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type XyoArchivistPayloadDivinerConfig<T extends XyoPayload = XyoPayload> = XyoDivinerConfig<
  XyoPayload,
  T & {
    schema: XyoArchivistPayloadDivinerConfigSchema
    archivist?: string
  }
>
