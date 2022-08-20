import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQueryPayload, XyoWitnessObserveQueryPayloadSchema } from './Observe'

export * from './Observe'

export type XyoWitnessQueryPayload<T extends XyoPayload = XyoPayload> = XyoWitnessObserveQueryPayload<T>

export type XyoWitnessQueryPayloadSchema = XyoWitnessObserveQueryPayloadSchema
