import { isPayloadOfSchemaType, isPayloadOfSchemaTypeWithMeta, notPayloadOfSchemaType } from '@xyo-network/payload-model'

import { BoundWitness, BoundWitnessSchema } from './BoundWitness'

export const isBoundWitness = isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)
export const isBoundWitnessWithMeta = isPayloadOfSchemaTypeWithMeta<BoundWitness>(BoundWitnessSchema)
export const notBoundWitness = notPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)

export const asBoundWitness = <T extends BoundWitness<{ schema: string }> = BoundWitness>(payload?: unknown) =>
  isBoundWitness(payload) ? (payload as T) : undefined

/** @deprecated use isBoundWitness instead*/
export const isBoundWitnessPayload = isBoundWitness
