import { XyoPayloadWithPartialMeta } from '@xyo-network/payload'

import { XyoBoundWitnessBase } from './Base'
import { XyoBoundWitnessMetaBase } from './Meta'

export type XyoBoundWitness<T extends object = object> = T & XyoBoundWitnessBase

export type XyoBoundWitnessMeta<T = unknown, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T & XyoBoundWitnessMetaBase<P>
export type XyoPartialBoundWitnessMeta<T = unknown, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T & Partial<XyoBoundWitnessMetaBase<P>>
export type XyoBoundWitnessWithMeta<T = unknown, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T & XyoBoundWitnessMetaBase<P> & XyoBoundWitnessBase
export type XyoBoundWitnessWithPartialMeta<T = unknown, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>> &
  XyoBoundWitnessBase
