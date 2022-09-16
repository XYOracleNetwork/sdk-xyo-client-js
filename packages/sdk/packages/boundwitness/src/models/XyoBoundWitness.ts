/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { EmptyObject } from '@xyo-network/core'
import { XyoPayloadWithPartialMeta } from '@xyo-network/payload'

import { XyoBoundWitness } from './Base'
import { XyoBoundWitnessMetaBase } from './Meta'

/** @deprecated - meta fields not supported by client anymore */
export type XyoBoundWitnessMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P>

/** @deprecated - meta fields not supported by client anymore */
export type XyoPartialBoundWitnessMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>>

/** @deprecated - meta fields not supported by client anymore */
export type XyoBoundWitnessWithMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  XyoBoundWitnessMetaBase<P> &
  XyoBoundWitness

/** @deprecated - meta fields not supported by client anymore */
export type XyoBoundWitnessWithPartialMeta<T extends EmptyObject = EmptyObject, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T &
  Partial<XyoBoundWitnessMetaBase<P>> &
  XyoBoundWitness
