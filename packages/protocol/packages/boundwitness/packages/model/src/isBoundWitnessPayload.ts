import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { BoundWitness, BoundWitnessSchema } from './models'

export const isBoundWitnessPayload = isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)
