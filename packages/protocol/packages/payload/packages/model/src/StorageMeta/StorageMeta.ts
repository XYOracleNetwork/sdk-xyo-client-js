import {
  type Hash, type Hex, isHash,
} from '@xylabs/hex'

import type { Payload } from '../Payload.ts'

export interface SequenceMeta {
  _sequence: Hex
}

export type WithPartialSequenceMeta<T extends Payload = Payload> = Partial<WithSequenceMeta<T>>

export type WithSequenceMeta<T extends Payload = Payload> = T & SequenceMeta

export interface HashMeta {
  _dataHash: Hash
  _hash: Hash
}

export type WithPartialHashMeta<T extends Payload = Payload> = Partial<WithHashMeta<T>>

export type WithHashMeta<T extends Payload = Payload> = T & HashMeta

export interface StorageMeta extends SequenceMeta, HashMeta {}

export type WithPartialStorageMeta<T extends Payload = Payload> = Partial<WithStorageMeta<T>>

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta

export const isSequenceMeta = (value: unknown): value is SequenceMeta => {
  return (value as WithSequenceMeta)?._sequence !== undefined
}

export const isHashMeta = (value: unknown): value is HashMeta => {
  return isHash((value as WithHashMeta)?._hash) && isHash((value as WithHashMeta)?._dataHash)
}

export const isStorageMeta = (value: unknown): value is StorageMeta => {
  return isSequenceMeta(value) && isHashMeta(value)
}

// "00005a7f354762f3ac1bc5ddc6cfd08d14" is and example of a local sequence string

// "00005a7f354762f3ac1bc5ddc6cfd08d14a123456789abcdef0123" is and example of a local sequence string
// epoch = "00005a7f354762f3ac"
// nonce = "1bc5ddc6cfd08d14"
// address = "a123456789abcdef0123"
