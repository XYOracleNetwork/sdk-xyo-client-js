import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerQueryPayload } from '../Diviner'

export type XyoPayloadDivinerQueryPayloadSchema = 'network.xyo.diviner.payload.query'
export const XyoPayloadDivinerQueryPayloadSchema: XyoPayloadDivinerQueryPayloadSchema = 'network.xyo.diviner.payload.query'

export type XyoPayloadDivinerQueryPayload<
  TSchema extends string = XyoPayloadDivinerQueryPayloadSchema,
  TConfig extends XyoPayload = XyoPayload,
> = XyoDivinerQueryPayload<
  TSchema,
  {
    huri: string
  } & TConfig
>
