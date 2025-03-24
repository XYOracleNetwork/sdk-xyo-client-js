import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType, isPayloadOfSchemaTypeWithSources } from '@xyo-network/payload-model'

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
   * The version of the schema major * 1,000,000 + minor * 1,000 + patch
   */
  version?: number
}, SchemaSchema>

/**
 * Identity function for determining if an object is an Schema
 */
export const isSchemaPayload = isPayloadOfSchemaType<SchemaPayload>(SchemaSchema)

/**
 * Identity function for determining if an object is an Schema with sources
 */
export const isSchemaPayloadWithSources = isPayloadOfSchemaTypeWithSources<SchemaPayload>(SchemaSchema)
