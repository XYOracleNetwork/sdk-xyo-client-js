import { XyoPayload, XyoSchemaPayload } from '@xyo-network/core'
import { XyoDomainConfig } from '@xyo-network/domain'

/**
 * Used in conjunction with schema validation to support compile time type assertion
 * for known schema types.
 */
export type PayloadValidator<T extends XyoPayload = XyoPayload> = ((x: XyoPayload) => x is T) | undefined

/**
 * Used to map known schemas (byt their string name) to the validators which assert their types
 */
export interface XyoSchemaNameToValidatorMap {
  'network.xyo.domain': PayloadValidator<XyoDomainConfig>
  'network.xyo.payload': PayloadValidator<XyoPayload>
  'network.xyo.schema': PayloadValidator<XyoSchemaPayload>
}
