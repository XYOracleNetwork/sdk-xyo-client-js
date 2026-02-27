import {
  HashZod,
  zodAsFactory, zodIsFactory, zodToFactory,
} from '@xylabs/sdk-js'
import type { ZodType } from 'zod'
import z from 'zod'

import type { Payload } from './Payload.ts'
import type { Schema } from './Schema.ts'
import { SchemaZod } from './Schema.ts'
import { SequenceFromStringZod } from './StorageMeta/index.ts'

export const HashMetaZod = z.object({
  _hash: HashZod,
  _dataHash: HashZod,
})

export type HashMeta = z.infer<typeof HashMetaZod>

export type WithHashMeta<T extends Payload> = T & HashMeta

export const isHashMeta = zodIsFactory(HashMetaZod)
export const asHashMeta = zodAsFactory(HashMetaZod, 'asHashMeta')
export const toHashMeta = zodToFactory(HashMetaZod, 'toHashMeta')

export const SequenceMetaZod = z.object({ _sequence: SequenceFromStringZod })

export type SequenceMeta = z.infer<typeof SequenceMetaZod>

export const isSequenceMeta = zodIsFactory(SequenceMetaZod)
export const asSequenceMeta = zodAsFactory(SequenceMetaZod, 'asSequenceMeta')
export const toSequenceMeta = zodToFactory(SequenceMetaZod, 'toSequenceMeta')

export const StorageMetaZod = z.object({
  _hash: HashZod,
  _dataHash: HashZod,
  _sequence: SequenceFromStringZod,
})

export type StorageMeta = z.infer<typeof StorageMetaZod>

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta

export const isStorageMeta = zodIsFactory(StorageMetaZod)
export const asStorageMeta = zodAsFactory(StorageMetaZod, 'asStorageMeta')
export const toStorageMeta = zodToFactory(StorageMetaZod, 'toStorageMeta')

export const PayloadZod = z.object({ schema: SchemaZod })

export const AnyPayloadZod = PayloadZod.loose()

export type AnyPayload = z.infer<typeof AnyPayloadZod>

export function WithStorageMetaZod<T extends ZodType>(valueZod: T) {
  return z.intersection(valueZod, StorageMetaZod)
}

export function WithHashMetaZod<T extends ZodType>(valueZod: T): z.ZodIntersection<T, typeof HashMetaZod>
export function WithHashMetaZod<T extends ZodType>(valueZod: T) {
  return z.intersection(valueZod, HashMetaZod)
}

export const PayloadZodStrict = z.strictObject({ schema: SchemaZod })
export type PayloadZodStrict = typeof PayloadZodStrict

export const PayloadZodLoose: PayloadZodStrict = z.looseObject({ schema: SchemaZod })
export type PayloadZodLoose = typeof PayloadZodLoose

export const PayloadZodOfSchema = <S extends Schema>(schema: S) => PayloadZod.extend({ schema: z.literal(schema) })
export const PayloadZodStrictOfSchema = <S extends Schema>(schema: S) => PayloadZodStrict.extend({ schema: z.literal(schema) })
export const PayloadZodLooseOfSchema = <S extends Schema>(schema: S) => PayloadZodLoose.extend({ schema: z.literal(schema) })
