import { XyoDomainPayload, XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'
import { XyoSchemaPayload, XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

/**
 * Used in conjunction with schema validation to support compile time type assertion
 * for known schema types.
 */
export type NarrowPayload<T extends XyoPayload = XyoPayload> = ((x: XyoPayload) => x is T) | undefined

/**
 * Used to map known schemas (byt their string name) to the validators which assert their types
 */
export interface XyoSchemaNameToValidatorMap {
  [XyoDomainSchema]: NarrowPayload<XyoDomainPayload>
  [XyoPayloadSchema]: NarrowPayload<XyoPayload>
  [XyoSchemaSchema]: NarrowPayload<XyoSchemaPayload>
}
