import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoPayloadMetaBase } from './XyoPayloadMeta'

export type XyoPayloadMeta<T extends EmptyObject = EmptyObject> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T extends EmptyObject = EmptyObject> = XyoPayload<T & XyoPayloadMetaBase>
export type XyoPayloadWithPartialMeta<T extends EmptyObject = EmptyObject> = XyoPayload<T & Partial<XyoPayloadMetaBase>>
