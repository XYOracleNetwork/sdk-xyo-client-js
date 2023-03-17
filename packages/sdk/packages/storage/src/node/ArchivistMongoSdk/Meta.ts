import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

export interface PayloadMetaBase {
  _archive?: string
  _client?: string
  _hash: string
  _observeDuration?: number
  _reportedHash?: string
  _schemaValid?: boolean
  _sources?: Payload[]
  _timestamp: number
  _user_agent?: string
}

export type PayloadMeta<T extends AnyObject = AnyObject> = T & PayloadMetaBase
export type XyoPartialPayloadMeta<T extends AnyObject = AnyObject> = T & Partial<PayloadMetaBase>
export type PayloadWithMeta<T extends AnyObject = AnyObject> = Payload<T & PayloadMetaBase>
export type PayloadWithPartialMeta<T extends AnyObject = AnyObject> = Payload<T & Partial<PayloadMetaBase>>

export type BoundWitnessMetaBase<P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = PayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>

export type BoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T & BoundWitnessMetaBase<P>

export type XyoPartialBoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<BoundWitnessMetaBase<P>>

export type BoundWitnessWithMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  BoundWitnessMetaBase<P> &
  BoundWitness

export type BoundWitnessWithPartialMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<BoundWitnessMetaBase<P>> &
  BoundWitness
