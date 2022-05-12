import { XyoPayloadBody } from './Body'
import { WithXyoPayloadMeta } from './WithXyoPayloadMeta'

type XyoPayload = WithXyoPayloadMeta<XyoPayloadBody>

export type { XyoPayload }
