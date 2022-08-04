import { XyoDomainPayload } from '@xyo-network/domain-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'

/**
 * Used in conjunction with schema validation to support compile time type assertion
 * for known schema types.
 */
export type PayloadValidator<T extends XyoPayload = XyoPayload> = ((x: XyoPayload) => x is T) | undefined

/**
 * Used to map known schemas (byt their string name) to the validators which assert their types
 */
export interface XyoSchemaNameToValidatorMap {
  'network.xyo.domain': PayloadValidator<XyoDomainPayload>
  'network.xyo.payload': PayloadValidator<XyoPayload>
  'network.xyo.schema': PayloadValidator<XyoSchemaPayload>
}
