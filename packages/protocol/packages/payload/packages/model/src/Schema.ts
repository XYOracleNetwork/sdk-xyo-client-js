import type { EmptyObject } from '@xylabs/object'
import { AsTypeFactory } from '@xylabs/object'

/** Schema type in Javascript is a string */
// eslint-disable-next-line sonarjs/redundant-type-aliases
export type Schema = string

export const PayloadSchema = 'network.xyo.payload' as const
export type PayloadSchema = typeof PayloadSchema

export const isSchema = (value: unknown): value is Schema => {
  return typeof value === 'string'
}

export const asSchema = AsTypeFactory.create<Schema>(isSchema)

/** Schema fields for a Payload */
export interface SchemaFields extends EmptyObject {
  /**  Schema of the object */
  schema: Schema
}

/** Add the Schema Fields to an object */
export type WithSchema<T extends EmptyObject | void = void> = T extends EmptyObject ? SchemaFields & T : SchemaFields
