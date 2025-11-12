import { HashZod } from '@xylabs/hex'
import z from 'zod'

import { SchemaZod } from './Schema.ts'
import { SequenceFromStringZod } from './StorageMeta/index.ts'

export const HashMetaZod = z.object({
  _hash: HashZod,
  _dataHash: HashZod,
})

export const SequenceMetaZod = z.object({ _sequence: SequenceFromStringZod })

export const StorageMetaZod = z.object({
  _hash: HashZod,
  _dataHash: HashZod,
  _sequence: SequenceFromStringZod,
})

export const PayloadZod = z.object({ schema: SchemaZod })

/** @deprecated use WithStorageMetaZod */
export const PayloadWithStorageMetaZod = PayloadZod.extend(StorageMetaZod.shape)

export const AnyPayloadZod = PayloadZod.catchall(z.json())

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

export const PayloadZodStrictOfSchema = <S extends string>(schema: S) => PayloadZodStrict.extend({ schema: z.literal(schema) })
export const PayloadZodLooseOfSchema = <S extends string>(schema: S) => PayloadZodLoose.extend({ schema: z.literal(schema) })
