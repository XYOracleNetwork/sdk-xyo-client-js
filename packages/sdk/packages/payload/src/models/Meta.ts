/* eslint-disable deprecation/deprecation */
import { EmptyObject } from '@xyo-network/core'

import { XyoPayload } from './Base'

/** @deprecated - meta fields not supported by client anymore */
export interface XyoPayloadMetaBase {
  _hash: string
  _observeDuration?: number
  _archive?: string
  _client?: string
  _reportedHash?: string
  _timestamp: number
  _sources?: XyoPayload[]
  _user_agent?: string
  _schemaValid?: boolean
}

/** @deprecated - meta fields not supported by client anymore */
export type XyoPayloadMeta<T extends EmptyObject = EmptyObject> = T & XyoPayloadMetaBase
/** @deprecated - meta fields not supported by client anymore */
export type XyoPartialPayloadMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoPayloadMetaBase>
/** @deprecated - meta fields not supported by client anymore */
export type XyoPayloadWithMeta<T extends EmptyObject = EmptyObject> = XyoPayload<T & XyoPayloadMetaBase>
/** @deprecated - meta fields not supported by client anymore */
export type XyoPayloadWithPartialMeta<T extends EmptyObject = EmptyObject> = XyoPayload<T & Partial<XyoPayloadMetaBase>>
/** @deprecated - meta fields not supported by client anymore */
