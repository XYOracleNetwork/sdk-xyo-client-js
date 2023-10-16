/* eslint-disable import/no-deprecated */
import { AnyObject } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { PayloadMetaBase } from './PayloadMeta'

/** @deprecated This type will be moved to mongodb specific package soon */
export type PayloadMeta<T extends AnyObject = AnyObject> = T & PayloadMetaBase
/** @deprecated This type will be moved to mongodb specific package soon */
export type PartialPayloadMeta<T extends AnyObject = AnyObject> = T & Partial<PayloadMetaBase>
/** @deprecated This type will be moved to mongodb specific package soon */
export type PayloadWithMeta<T extends AnyObject = AnyObject> = Payload<T & PayloadMetaBase>
/** @deprecated This type will be moved to mongodb specific package soon */
export type PayloadWithPartialMeta<T extends AnyObject = AnyObject> = Payload<T & Partial<PayloadMetaBase>>
/** @deprecated This type will be moved to mongodb specific package soon */
