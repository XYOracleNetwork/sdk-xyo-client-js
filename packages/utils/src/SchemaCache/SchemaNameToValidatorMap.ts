import { XyoPayload, XyoSchemaPayload } from '@xyo-network/core'
import { XyoDomainConfig } from '@xyo-network/domain'

export type PayloadValidator<T extends XyoPayload = XyoPayload> = ((x: XyoPayload) => x is T) | undefined

export interface XyoSchemaNameToValidatorMap {
  'network.xyo.domain': PayloadValidator<XyoDomainConfig>
  'network.xyo.payload': PayloadValidator<XyoPayload>
  'network.xyo.schema': PayloadValidator<XyoSchemaPayload>
}
