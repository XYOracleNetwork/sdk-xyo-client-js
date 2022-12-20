import { isXyoPayloadOfSchemaType } from '@xyo-network/payload'

import { XyoBoundWitness, XyoBoundWitnessSchema } from './models'

export const isXyoBoundWitnessPayload = isXyoPayloadOfSchemaType<XyoBoundWitness>(XyoBoundWitnessSchema)
