import { HashToJsonZod } from '@xylabs/hex'
import { z } from 'zod'

import { SchemaZod } from './Schema.ts'
import { SequenceToStringZod } from './StorageMeta/index.ts'

export const StorageMetaZod = z.object({
  _hash: HashToJsonZod,
  _dataHash: HashToJsonZod,
  _sequence: SequenceToStringZod,
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
