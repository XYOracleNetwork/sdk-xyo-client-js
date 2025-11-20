import type { EmptyObject } from '@xylabs/object'
import { zodAsFactory, zodIsFactory } from '@xylabs/zod'
import z from 'zod'

export const SchemaRegEx = /^(?:[a-z0-9]+\.)*[a-z0-9]+$/

export const SchemaZod = z.string().regex(SchemaRegEx)
export type Schema = z.infer<typeof SchemaZod>

export const makeSchema = <T extends string>(value: T) => {
  return (z.templateLiteral([z.literal(value)])).transform(x => x as (typeof x & { __schema: true }))
}

export const PayloadSchema = 'network.xyo.payload' as const
export const PayloadSchemaZod = z.literal(PayloadSchema)
export type PayloadSchema = z.infer<typeof PayloadSchemaZod>

export const isSchema = zodIsFactory(SchemaZod)
export const asSchema = zodAsFactory(SchemaZod, 'asSchema')
export const toSchema = zodAsFactory(SchemaZod, 'toSchema')

/** Add the Schema Fields to an object */
export type WithSchema<T extends EmptyObject | void = void> = T extends EmptyObject ? SchemaFields & T : SchemaFields

/** Schema fields for a Payload */
export interface SchemaFields extends EmptyObject {
  /**  Schema of the object */
  schema: Schema
}
