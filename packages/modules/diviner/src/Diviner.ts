import { XyoModule, XyoQueryPayload } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoDivinerQueryPayloadSchema = 'network.xyo.diviner.query'
export const XyoDivinerQueryPayloadSchema: XyoDivinerQueryPayloadSchema = 'network.xyo.diviner.query'

export type XyoDivinerQueryPayload<
  TSchema extends string = string,
  TQuery extends XyoQueryPayload = XyoQueryPayload,
  TPayload extends XyoPayload = XyoPayload,
> = XyoQueryPayload<
  {
    schema: TSchema
    payloads: TPayload[]
  } & TQuery
>

export type XyoDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload> = XyoModule<Q>
