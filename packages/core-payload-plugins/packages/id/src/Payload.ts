import {
  isPayloadOfSchemaType,
  isPayloadOfSchemaTypeWithMeta,
  isPayloadOfSchemaTypeWithSources,
  Payload,
  WithMeta,
  WithSources,
} from '@xyo-network/payload-model'

import { IdSchema } from './Schema.js'

export type IdPayload = Payload<{
  salt: string
  schema: IdSchema
}>

/**
 * Identity helper for ID Payload
 */
export const isId = isPayloadOfSchemaType<IdPayload>(IdSchema)
/**
 * Identity helper for ID Payload with meta
 */
export const isIdWithMeta = isPayloadOfSchemaTypeWithMeta<WithMeta<IdPayload>>(IdSchema)
/**
 * Identity helper for ID Payload with sources
 */
export const isIdWithSources = isPayloadOfSchemaTypeWithSources<WithSources<IdPayload>>(IdSchema)
