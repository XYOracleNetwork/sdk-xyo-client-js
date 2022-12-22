import { isXyoPayloadOfSchemaType } from '@xyo-network/payload-model'

import { XyoBoundWitness, XyoBoundWitnessSchema } from './models'

export const isXyoBoundWitnessPayload = isXyoPayloadOfSchemaType<XyoBoundWitness>(XyoBoundWitnessSchema)
