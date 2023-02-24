import { AnyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoPayloadMetaBase } from './XyoPayloadMeta'

export type XyoPayloadMeta<T extends AnyObject = AnyObject> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T extends AnyObject = AnyObject> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T extends AnyObject = AnyObject> = XyoPayload<T & XyoPayloadMetaBase>
export type XyoPayloadWithPartialMeta<T extends AnyObject = AnyObject> = XyoPayload<T & Partial<XyoPayloadMetaBase>>
