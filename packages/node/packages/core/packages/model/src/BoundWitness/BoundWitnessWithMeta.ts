import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'

import { PayloadWithPartialMeta } from '../Payload'
import { BoundWitnessMetaBase } from './BoundWitnessMeta'

export type BoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T & BoundWitnessMetaBase<P>

export type PartialBoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<BoundWitnessMetaBase<P>>

export type BoundWitnessWithMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  BoundWitnessMetaBase<P> &
  BoundWitness

export type BoundWitnessWithPartialMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<BoundWitnessMetaBase<P>> &
  BoundWitness
