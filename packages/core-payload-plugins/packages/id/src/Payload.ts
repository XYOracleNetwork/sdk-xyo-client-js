import { AsObjectFactory } from '@xylabs/object'
import {
  isPayloadOfSchemaType,
  isPayloadOfSchemaTypeWithSources,
  Payload,
  WithSources,
} from '@xyo-network/payload-model'

import { IdSchema } from './Schema.ts'

/**
 * The fields of an ID Payload
 */
export type IdFields = {
  salt: string
}

/**
 * The ID Payload
 */
export type Id = Payload<IdFields, IdSchema>

/**
 * @deprecated Use `Id` instead
 */

// eslint-disable-next-line sonarjs/redundant-type-aliases
export type IdPayload = Id

/**
 * Identity helper for ID Payload
 */
export const isId = isPayloadOfSchemaType<Id>(IdSchema)
export const asId = AsObjectFactory.create(isId)
export const asOptionalId = AsObjectFactory.createOptional(isId)

/**
 * Identity helper for ID Payload with sources
 */
export const isIdWithSources = isPayloadOfSchemaTypeWithSources<WithSources<Id>>(IdSchema)
