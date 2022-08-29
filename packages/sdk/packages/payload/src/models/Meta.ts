import { EmptyObject } from '@xyo-network/core'

import { XyoPayload } from './Base'

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

export type XyoPayloadMeta<T extends EmptyObject = EmptyObject> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T extends EmptyObject = EmptyObject> = XyoPayload<T & XyoPayloadMetaBase>
export type XyoPayloadWithPartialMeta<T extends EmptyObject = EmptyObject> = XyoPayload<T & Partial<XyoPayloadMetaBase>>
