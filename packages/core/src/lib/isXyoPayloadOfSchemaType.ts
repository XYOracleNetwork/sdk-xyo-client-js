import { XyoBoundWitness } from '../BoundWitness'
import { XyoPayload } from '../models'
import { XyoSchemaPayload } from '../Schema'

export const isXyoPayloadOfSchemaType = <T extends XyoPayload>(schema: string) => {
  return (x: XyoPayload): x is T => x.schema === schema
}

export const isXyoSchemaPayload = isXyoPayloadOfSchemaType<XyoSchemaPayload>('network.xyo.schema')
export const isXyoBoundWitnessPayload = isXyoPayloadOfSchemaType<XyoBoundWitness>('network.xyo.boundwitness')
