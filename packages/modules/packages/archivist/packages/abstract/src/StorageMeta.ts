import type { Hash } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'

export interface StorageMeta {
  _dataHash: Hash
  _hash: Hash
  // this sequence number must be a 0 padded string representation of a 128 bit sequence number
  _sequence: string
}

export type WithPartialStorageMeta<T extends Payload = Payload> = Partial<WithStorageMeta<T>>

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta

// the max sequence index which allows for that number of items to be stored at one time stamp (32 bit max value)
export const maxSequenceIndex = 4_294_967_295n

// the max number of characters in a sequence string which can accommodate a 128 bit unsigned number
export const maxSequenceStringCharacters = 40
