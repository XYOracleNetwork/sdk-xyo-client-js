import { XyoPayloadBase } from './Base'
import { XyoPayload } from './XyoPayload'

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

export type XyoPayloadMeta<T = unknown> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T = unknown> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T = unknown> = T & XyoPayloadMetaBase & XyoPayloadBase
export type XyoPayloadWithPartialMeta<T = unknown> = T & Partial<XyoPayloadMetaBase> & XyoPayloadBase

export type XyoQueryPayloadMeta<T = unknown> = T & XyoQueryPayloadMetaBase
export type XyoQueryPartialPayloadMeta<T = unknown> = T & Partial<XyoQueryPayloadMetaBase>
export type XyoQueryPayloadWithMeta<T = unknown> = T & XyoQueryPayloadMetaBase & XyoPayloadBase
export type XyoQueryPayloadWithPartialMeta<T = unknown> = T & Partial<XyoQueryPayloadMetaBase> & XyoPayloadBase
