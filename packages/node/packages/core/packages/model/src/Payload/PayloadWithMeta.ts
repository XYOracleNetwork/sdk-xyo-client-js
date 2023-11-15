/* eslint-disable import/no-deprecated */
import { AnyObject } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { PayloadMetaBase } from './PayloadMeta'

/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
export type PayloadMeta<T extends AnyObject = AnyObject> = T & PayloadMetaBase
/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
export type PartialPayloadMeta<T extends AnyObject = AnyObject> = T & Partial<PayloadMetaBase>
/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
export type PayloadWithMeta<T extends AnyObject = AnyObject> = Payload<T & PayloadMetaBase>
/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
export type PayloadWithPartialMeta<T extends AnyObject = AnyObject> = Payload<T & Partial<PayloadMetaBase>>
/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
