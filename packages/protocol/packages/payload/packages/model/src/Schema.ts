import type { EmptyObject } from '@xylabs/object'
import { AsTypeFactory } from '@xylabs/object'
import { z } from 'zod'

export const SchemaRegEx = /^(?:[a-z0-9]+\.)*[a-z0-9]+$/

export const SchemaZodV1 = z.string().regex(SchemaRegEx)
export const SchemaZodV2 = z.string().regex(SchemaRegEx).transform(x => x as (typeof x & { __schema: true }))
export type SchemaV2 = z.output<typeof SchemaZodV2>
export type SchemaV1 = z.output<typeof SchemaZodV1>
export const SchemaZod = z.union([SchemaZodV1, SchemaZodV2])
export type Schema = z.infer<typeof SchemaZodV1>

export const makeSchema = <T extends string>(value: T) => {
  return (z.templateLiteral([z.literal(value)])).transform(x => x as (typeof x & { __schema: true }))
}

export const PayloadSchema = 'network.xyo.payload' as const
export const PayloadSchemaZod = z.literal(PayloadSchema)
export type PayloadSchema = z.infer<typeof PayloadSchemaZod>

export const isSchema = (value: unknown): value is Schema => {
  return SchemaZod.safeParse(value).error === undefined
}

export const asSchema = AsTypeFactory.create<Schema>(isSchema)

/** Add the Schema Fields to an object */
export type WithSchema<T extends EmptyObject | void = void> = T extends EmptyObject ? SchemaFields & T : SchemaFields

/** Schema fields for a Payload */
export interface SchemaFields extends EmptyObject {
  /**  Schema of the object */
  schema: Schema
}
