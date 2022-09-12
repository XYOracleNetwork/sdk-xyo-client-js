import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Observe'

export * from './Observe'

export type XyoWitnessQuery<T extends XyoPayload = XyoPayload> = XyoWitnessObserveQuery<T>

export type XyoWitnessQuerySchema = XyoWitnessObserveQuerySchema
