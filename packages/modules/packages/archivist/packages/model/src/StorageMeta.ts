import type { Hash, Hex } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'

export interface StorageMeta {
  _dataHash: Hash
  _hash: Hash
  // this sequence number must be a 0 padded string representation of a 18 byte sequence number
  _sequence: Hex // zero padded epoch/index (when returned, has address as suffix) - to be used as a universal cursor
}

export type WithPartialStorageMeta<T extends Payload = Payload> = Partial<WithStorageMeta<T>>

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta

const StorageMetaComponentConstants = {
  epochBytes: 8,
  nonceBytes: 8,
  addressBytes: 20,
}

const StorageMetaLocalConstants = {
  maxEpoch: Math.pow(256, StorageMetaComponentConstants.epochBytes) - 1,
  localSequenceBytes: StorageMetaComponentConstants.epochBytes + StorageMetaComponentConstants.nonceBytes,
  ...StorageMetaComponentConstants,
}

export const SequenceConstants = {
  qualifiedSequenceBytes: StorageMetaLocalConstants.localSequenceBytes + StorageMetaComponentConstants.addressBytes,
  ...StorageMetaLocalConstants,
}

// "00005a7f354762f3ac1bc5ddc6cfd08d14" is and example of a local sequence string

// "00005a7f354762f3ac1bc5ddc6cfd08d14a123456789abcdef0123" is and example of a local sequence string
// epoch = "00005a7f354762f3ac"
// nonce = "1bc5ddc6cfd08d14"
// address = "a123456789abcdef0123"
