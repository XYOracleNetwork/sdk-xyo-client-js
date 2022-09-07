import { XyoDomainPayload, XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { XyoPayload, XyoSchema } from '@xyo-network/payload'
import { XyoSchemaPayload, XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

/**
 * Used in conjunction with schema validation to support compile time type assertion
 * for known schema types.
 */
export type PayloadValidator<T extends XyoPayload = XyoPayload> = ((x: XyoPayload) => x is T) | undefined

/**
 * Used to map known schemas (byt their string name) to the validators which assert their types
 */
export interface XyoSchemaNameToValidatorMap {
  [XyoDomainSchema]: PayloadValidator<XyoDomainPayload>
  [XyoSchema]: PayloadValidator<XyoPayload>
  [XyoSchemaSchema]: PayloadValidator<XyoSchemaPayload>
}
