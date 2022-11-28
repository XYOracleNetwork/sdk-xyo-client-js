import { DivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

export type XyoArchiveListApiDivinerConfigSchema = 'network.xyo.diviner.archive.list.api.config'
export const XyoArchiveListApiDivinerConfigSchema: XyoArchiveListApiDivinerConfigSchema = 'network.xyo.diviner.archive.list.api.config'

export type XyoArchiveSchema = 'network.xyo.archive'
export const XyoArchiveSchema: XyoArchiveSchema = 'network.xyo.archive'

export type XyoArchiveListApiDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  XyoPayload,
  T & {
    schema: XyoArchiveListApiDivinerConfigSchema
  }
>
