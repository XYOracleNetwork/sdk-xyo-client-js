import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { XyoBoundWitness, XyoBoundWitnessSchema } from './models'

export const isXyoBoundWitnessPayload = isPayloadOfSchemaType<XyoBoundWitness>(XyoBoundWitnessSchema)
