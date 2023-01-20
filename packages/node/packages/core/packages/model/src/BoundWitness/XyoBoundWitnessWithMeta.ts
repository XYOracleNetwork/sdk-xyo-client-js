import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EmptyObject } from '@xyo-network/core'

import { XyoPayloadWithPartialMeta } from '../Payload'
import { XyoBoundWitnessMetaBase } from './XyoBoundWitnessMeta'

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
