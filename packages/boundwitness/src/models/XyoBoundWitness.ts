import { XyoPayloadWithPartialMeta } from '@xyo-network/payload'

import { XyoBoundWitnessBase } from './Base'
import { XyoBoundWitnessMeta } from './Meta'

export type XyoBoundWitness<T extends object = object> = T & XyoBoundWitnessBase
export type XyoBoundWitnessWithMeta<T = unknown, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T & XyoBoundWitnessMeta<P> & XyoBoundWitness
export type XyoBoundWitnessWithPartialMeta<T = unknown, P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = T & Partial<XyoBoundWitnessMeta<P>> & XyoBoundWitness
