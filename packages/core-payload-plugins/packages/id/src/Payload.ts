import type {
  Payload,
  WithMeta,
  WithSources,
} from '@xyo-network/payload-model'
import {
  isPayloadOfSchemaType,
  isPayloadOfSchemaTypeWithMeta,
  isPayloadOfSchemaTypeWithSources,
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
export type IdPayload = Id

/**
 * Identity helper for ID Payload
 */
export const isId = isPayloadOfSchemaType<Id>(IdSchema)

/**
 * Identity helper for ID Payload with meta
 */
export const isIdWithMeta = isPayloadOfSchemaTypeWithMeta<WithMeta<Id>>(IdSchema)

/**
 * Identity helper for ID Payload with sources
 */
export const isIdWithSources = isPayloadOfSchemaTypeWithSources<WithSources<Id>>(IdSchema)
