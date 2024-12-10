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

// the max sequence index which allows for that number of items to be stored at one time stamp (32 bit (4 byte) max value)
export const maxSequenceEpochNonce = 4_294_967_295n

// the max number of characters in a local sequence string which can accommodate a
// 32 bit unsigned number(epoch) + 32 bits for entropy (last 8 characters of a 32 byte root hash)
export const maxLocalSequenceStringCharacters = 8 + 8 // 8 characters for the sequence number, 8 for the last 8 of root hash

// the max number of characters in a sequence string which can accommodate a local sequence string + 20 characters for the address
export const maxSequenceStringCharacters = maxLocalSequenceStringCharacters + 20 // total 36 characters

// "00005a7f354762f3ac" is and example of a local sequence string

// "00005a7f354762f3aca123456789abcdef0123" is and example of a local sequence string
// epoch = "00005a7f3"
// hash = "54762f3ac"
// address = "a123456789abcdef0123"
