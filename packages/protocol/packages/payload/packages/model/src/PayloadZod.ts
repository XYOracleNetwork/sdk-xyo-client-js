import { HashZod } from '@xylabs/hex'
import {
  zodAsFactory, zodIsFactory, zodToFactory,
} from '@xylabs/zod'
import z from 'zod'

import type { Schema } from './Schema.ts'
import { SchemaZod } from './Schema.ts'
import { SequenceFromStringZod } from './StorageMeta/index.ts'

export const HashMetaZod = z.object({
  _hash: HashZod,
  _dataHash: HashZod,
})

export type HashMeta = z.infer<typeof HashMetaZod>

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

export const isStorageMeta = zodIsFactory(StorageMetaZod)
export const asStorageMeta = zodAsFactory(StorageMetaZod, 'asStorageMeta')
export const toStorageMeta = zodToFactory(StorageMetaZod, 'toStorageMeta')

export const PayloadZod = z.object({ schema: SchemaZod })

/** @deprecated use WithStorageMetaZod */
export const PayloadWithStorageMetaZod = PayloadZod.extend(StorageMetaZod.shape)

export const AnyPayloadZod = PayloadZod.loose()

/** @deprecated use WithStorageMetaZod */
export const AnyPayloadWithStorageMetaZod = AnyPayloadZod.extend(StorageMetaZod.shape)

/** @deprecated use WithStorageMetaZod */
// eslint-disable-next-line sonarjs/deprecation
export type PayloadWithStorageMeta = z.infer<typeof PayloadWithStorageMetaZod>

export type AnyPayload = z.infer<typeof AnyPayloadZod>

/** @deprecated use WithStorageMetaZod */
// eslint-disable-next-line sonarjs/deprecation
export type AnyPayloadWithStorageMeta = z.infer<typeof AnyPayloadWithStorageMetaZod>

export function WithStorageMetaZod<T extends z.ZodRawShape>(valueZod: z.ZodObject<T>) {
  return valueZod.extend(StorageMetaZod.shape)
}

export function WithHashMetaZod<T extends z.ZodRawShape>(valueZod: z.ZodObject<T>) {
  return valueZod.extend(HashMetaZod.shape)
}

export const PayloadZodStrict = z.strictObject({ schema: SchemaZod })
export type PayloadZodStrict = typeof PayloadZodStrict

export const PayloadZodLoose: PayloadZodStrict = z.looseObject({ schema: SchemaZod })
export type PayloadZodLoose = typeof PayloadZodLoose

export const PayloadZodOfSchema = <S extends Schema>(schema: S) => PayloadZod.extend({ schema: z.literal(schema) })
export const PayloadZodStrictOfSchema = <S extends Schema>(schema: S) => PayloadZodStrict.extend({ schema: z.literal(schema) })
export const PayloadZodLooseOfSchema = <S extends Schema>(schema: S) => PayloadZodLoose.extend({ schema: z.literal(schema) })
