import { HashZod } from '@xylabs/hex'
import * as z from 'zod'

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
export const PayloadWithStorageMetaZod = PayloadZod.extend(StorageMetaZod.shape)

export const AnyPayloadZod = PayloadZod.catchall(z.json())
export const AnyPayloadWithStorageMetaZod = AnyPayloadZod.extend(StorageMetaZod.shape)

export type PayloadWithStorageMeta = z.infer<typeof PayloadWithStorageMetaZod>

export type AnyPayload = z.infer<typeof AnyPayloadZod>
export type AnyPayloadWithStorageMeta = z.infer<typeof AnyPayloadWithStorageMetaZod>

export function WithStorageMetaZod<T extends typeof PayloadZod>(valueZod: T) {
  return StorageMetaZod.extend(valueZod.shape)
}

export const PayloadZodStrict = z.strictObject({ schema: SchemaZod })
export type PayloadZodStrict = typeof PayloadZodStrict
export const PayloadZodLoose: PayloadZodStrict = z.looseObject({ schema: SchemaZod })

export const PayloadZodStrictOfSchema = <S extends string>(schema: S) => PayloadZodStrict.extend({ schema: z.literal(schema) })
export const PayloadZodLooseOfSchema = <S extends string>(schema: S) => PayloadZodLoose.extend({ schema: z.literal(schema) })
