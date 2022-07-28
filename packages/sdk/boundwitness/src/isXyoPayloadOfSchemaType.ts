import { isXyoPayloadOfSchemaType } from '@xyo-network/payload'

import { XyoBoundWitness } from './models'

export const isXyoBoundWitnessPayload = isXyoPayloadOfSchemaType<XyoBoundWitness>('network.xyo.boundwitness')
