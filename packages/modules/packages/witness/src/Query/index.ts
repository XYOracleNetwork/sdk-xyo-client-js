import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQueryPayload, XyoWitnessObserveQuerySchema } from './Observe'

export * from './Observe'

export type XyoWitnessQueryPayload<T extends XyoPayload = XyoPayload> = XyoWitnessObserveQueryPayload<T>

export type XyoWitnessQueryPayloadSchema = XyoWitnessObserveQuerySchema
