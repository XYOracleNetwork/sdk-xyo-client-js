import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

export interface XyoPayloadMetaBase {
  _archive?: string
  _client?: string
  _hash: string
  _observeDuration?: number
  _reportedHash?: string
  _schemaValid?: boolean
  _sources?: XyoPayload[]
  _timestamp: number
  _user_agent?: string
}

export type XyoPayloadMeta<T extends AnyObject = AnyObject> = T & XyoPayloadMetaBase
export type XyoPartialPayloadMeta<T extends AnyObject = AnyObject> = T & Partial<XyoPayloadMetaBase>
export type XyoPayloadWithMeta<T extends AnyObject = AnyObject> = XyoPayload<T & XyoPayloadMetaBase>
export type XyoPayloadWithPartialMeta<T extends AnyObject = AnyObject> = XyoPayload<T & Partial<XyoPayloadMetaBase>>

export type XyoBoundWitnessMetaBase<P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = XyoPayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>

export type XyoBoundWitnessMeta<T extends AnyObject = AnyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P>

export type XyoPartialBoundWitnessMeta<T extends AnyObject = AnyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>>

export type XyoBoundWitnessWithMeta<T extends AnyObject = AnyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P> &
  XyoBoundWitness

export type XyoBoundWitnessWithPartialMeta<T extends AnyObject = AnyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>> &
  XyoBoundWitness
