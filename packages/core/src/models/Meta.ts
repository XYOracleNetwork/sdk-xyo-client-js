import { XyoPayloadBase } from './Base'
import { XyoPayload } from './XyoPayload'

export interface XyoPayloadMetaBase {
  _hash: string
  _observeDuration?: number
  _archive: string
  _client?: string
  _reportedHash?: string
  _timestamp: number
  _sources?: XyoPayload[]
}

export type XyoPayloadMeta<T = unknown> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T = unknown> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T = unknown> = T & XyoPayloadMetaBase & XyoPayloadBase
export type XyoPayloadWithPartialMeta<T = unknown> = T & Partial<XyoPayloadMetaBase> & XyoPayloadBase
