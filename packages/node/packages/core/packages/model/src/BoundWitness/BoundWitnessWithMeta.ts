/* eslint-disable import/no-deprecated */
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'

import { PayloadWithPartialMeta } from '../Payload'
import { BoundWitnessMetaBase } from './BoundWitnessMeta'

/** @deprecated This type will be moved to mongodb specific package soon */
export type BoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T & BoundWitnessMetaBase<P>

/** @deprecated This type will be moved to mongodb specific package soon */
export type PartialBoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<BoundWitnessMetaBase<P>>

/** @deprecated This type will be moved to mongodb specific package soon */
export type BoundWitnessWithMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  BoundWitnessMetaBase<P> &
  BoundWitness

/** @deprecated This type will be moved to mongodb specific package soon */
export type BoundWitnessWithPartialMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<BoundWitnessMetaBase<P>> &
  BoundWitness
