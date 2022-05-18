import { XyoBoundWitness, XyoPayload, XyoSchemaPayload } from '@xyo-network/core'

export type PayloadValidator<T extends XyoPayload = XyoPayload> = (x: XyoPayload) => x is T

export interface XyoSchemaNameToValidatorMap {
  'network.xyo.boundwitness': PayloadValidator<XyoBoundWitness>
  'network.xyo.payload': PayloadValidator<XyoPayload>
  'network.xyo.schema': PayloadValidator<XyoSchemaPayload>
}
