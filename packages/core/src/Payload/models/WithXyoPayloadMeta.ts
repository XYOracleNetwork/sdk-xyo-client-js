import { XyoPayloadBody } from './Body'
import { XyoPayloadMeta } from './Meta'

type WithXyoPayloadMeta<T extends XyoPayloadBody> = T & XyoPayloadMeta

export type { WithXyoPayloadMeta }
