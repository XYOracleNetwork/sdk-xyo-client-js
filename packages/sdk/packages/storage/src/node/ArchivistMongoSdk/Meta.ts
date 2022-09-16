import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'

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

export type XyoBoundWitnessMetaBase<P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = XyoPayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>

export type XyoBoundWitnessMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P>

export type XyoPartialBoundWitnessMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>>

export type XyoBoundWitnessWithMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P> &
  XyoBoundWitness

export type XyoBoundWitnessWithPartialMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>> &
  XyoBoundWitness
