import { XyoPayloadBody } from './Body'
import { WithXyoPayloadMeta } from './WithXyoPayloadMeta'

export type XyoPayloadFull = WithXyoPayloadMeta<XyoPayloadBody>

export type XyoPayload<T = XyoPayloadFull> = T extends XyoPayloadFull ? T : XyoPayloadFull & T
