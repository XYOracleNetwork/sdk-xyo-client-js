import { isPayloadOfSchemaType, notPayloadOfSchemaType } from '@xyo-network/payload-model'

import { BoundWitness, BoundWitnessSchema } from './BoundWitness'

export const isBoundWitness = isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)
export const notBoundWitness = notPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)

/** @deprecated use isBoundWitness instead*/
export const isBoundWitnessPayload = isBoundWitness
