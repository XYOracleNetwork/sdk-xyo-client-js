import type { Brand } from '@xylabs/sdk-js'
import { zodAsFactory, zodIsFactory } from '@xylabs/zod'
import z from 'zod'

export type BrandedSchema<T extends string = string> = Brand<T, { readonly __schema: true }>
export const SchemaRegEx = /^(?:[a-z0-9]+\.)*[a-z0-9]+$/

export const SchemaZod = z.string().regex(SchemaRegEx).transform<BrandedSchema>(v => v as BrandedSchema)
export type Schema<T extends string = string> = z.infer<typeof SchemaZod> & BrandedSchema<T>

export const makeSchema = <T extends string>(value: T) => {
  return (z.templateLiteral([z.literal(value)])).transform(x => x as (typeof x & { __schema: true }))
}

export const isSchema = zodIsFactory(SchemaZod)
export const asSchema = zodAsFactory(SchemaZod, 'asSchema')
export const toSchema = zodAsFactory(SchemaZod, 'toSchema')

export const PayloadSchema = asSchema('network.xyo.payload', true)
export const PayloadSchemaZod = z.literal(PayloadSchema)
export type PayloadSchema = z.infer<typeof PayloadSchemaZod>
