import { AnyObject } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { PayloadMetaBase } from './PayloadMeta'

export type PayloadMeta<T extends AnyObject = AnyObject> = T & PayloadMetaBase
export type PartialPayloadMeta<T extends AnyObject = AnyObject> = T & Partial<PayloadMetaBase>
export type PayloadWithMeta<T extends AnyObject = AnyObject> = Payload<T & PayloadMetaBase>
export type PayloadWithPartialMeta<T extends AnyObject = AnyObject> = Payload<T & Partial<PayloadMetaBase>>
