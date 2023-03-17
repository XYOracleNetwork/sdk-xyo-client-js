import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'

import { PayloadWithPartialMeta } from '../Payload'
import { XyoBoundWitnessMetaBase } from './XyoBoundWitnessMeta'

export type XyoBoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P>

export type XyoPartialBoundWitnessMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>>

export type XyoBoundWitnessWithMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P> &
  XyoBoundWitness

export type XyoBoundWitnessWithPartialMeta<T extends AnyObject = AnyObject, P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>> &
  XyoBoundWitness
