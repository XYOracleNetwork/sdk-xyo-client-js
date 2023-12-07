import { AsTypeFactory, EmptyObject } from '@xyo-network/object'

/** Schema type in Javascript is a string */
export type Schema = string

export const PayloadSchema = 'network.xyo.payload'
export type PayloadSchema = typeof PayloadSchema

export const isSchema = (value: unknown): value is Schema => {
  if (typeof value === 'string') {
    return true
  }
  return false
}

export const asSchema = AsTypeFactory.create<Schema>(isSchema)

/** Schema fields for a Payload */
export interface SchemaFields extends EmptyObject {
  schema: Schema
}

/** Add the Schema Fields to an object */
export type WithSchema<T extends EmptyObject | void = void> = T extends EmptyObject ? SchemaFields & T : SchemaFields
