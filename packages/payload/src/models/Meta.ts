import { EmptyObject } from '@xyo-network/core'

import { XyoPayloadBase } from './Base'

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

export interface XyoQueryPayloadMetaBase extends XyoPayloadMetaBase {
  _queryId: string
}
export type XyoPayload<T extends EmptyObject = EmptyObject> = T & XyoPayloadBase

export type XyoPayloadMeta<T extends EmptyObject = EmptyObject> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T extends EmptyObject = EmptyObject> = T & XyoPayloadMetaBase & XyoPayloadBase
export type XyoPayloadWithPartialMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoPayloadMetaBase> & XyoPayloadBase

export type XyoQueryPayloadMeta<T extends EmptyObject = EmptyObject> = T & XyoQueryPayloadMetaBase
export type XyoQueryPartialPayloadMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoQueryPayloadMetaBase>
export type XyoQueryPayloadWithMeta<T extends EmptyObject = EmptyObject> = T & XyoQueryPayloadMetaBase & XyoPayloadBase
export type XyoQueryPayloadWithPartialMeta<T extends EmptyObject = EmptyObject> = T & Partial<XyoQueryPayloadMetaBase> & XyoPayloadBase
