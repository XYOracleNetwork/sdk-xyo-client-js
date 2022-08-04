import { EmptyObject } from '@xyo-network/core'
import { XyoPayloadWithPartialMeta } from '@xyo-network/payload'

import { XyoBoundWitness } from './Base'
import { XyoBoundWitnessMetaBase } from './Meta'

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
