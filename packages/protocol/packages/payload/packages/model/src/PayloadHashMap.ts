import type { Hash } from '@xylabs/sdk-js'

import type { Payload } from './Payload.ts'

export interface PayloadHashMap<TPayload extends Payload = Payload, TId extends string | number | symbol = Hash> {
  // these hashes are data hashes, but reference an arbitrary root hash that matches the data hash
  // this list can be shorter than the full list since multiple root hashes may have the same data hash
  dataHash: Record<TId, TId>
  // this if the full list of all payloads
  hash: Record<TId, TPayload>
}
