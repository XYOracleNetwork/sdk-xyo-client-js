import {
  isPayloadOfSchemaType, isPayloadOfSchemaTypeWithMeta, isPayloadOfSchemaTypeWithSources, type Payload,
} from '@xyo-network/payload-model'

import { SchemaSchema } from './Schema.ts'

export type SchemaPayload = Payload<{
  /**
   * The schema definition
   */
  definition: {
    [key: string]: unknown
    $id?: string
  }
  /**
   * The schema this schema extends (if any)
   */
  extends?: string

  /** @deprecated use definition.$id instead */
  name?: string

  /**
   * Identifies this payload as a Schema
   */
  schema: SchemaSchema
}>

/**
 * Identity function for determining if an object is an Schema
 */
export const isSchemaPayload = isPayloadOfSchemaType<SchemaPayload>(SchemaSchema)

/**
 * Identity function for determining if an object is an Schema with sources
 */
export const isSchemaPayloadWithSources = isPayloadOfSchemaTypeWithSources<SchemaPayload>(SchemaSchema)

/**
 * Identity function for determining if an object is an Schema with meta
 */
export const isSchemaPayloadWithMeta = isPayloadOfSchemaTypeWithMeta<SchemaPayload>(SchemaSchema)
