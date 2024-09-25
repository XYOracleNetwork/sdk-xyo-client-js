import type { Hash } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'

import { boundWitnessArrayPropertyContainsAny } from '../util/index.ts'

/**
 * Checks if the boundwitness contains any of the payload hashes. If the payload hashes array
 * is empty, it will return true. This is to match the behavior or payload hashesContainsAll
 * which will return true if the payload hashes array is empty.
 * @param bw The boundwitness to check
 * @param payloadHashes The payload hashes to check for
 * @returns True if the boundwitness contains any of the payload hashes
 */
export const payloadHashesContainsAny = (bw: BoundWitness, payloadHashes: Hash[]): boolean => {
  return boundWitnessArrayPropertyContainsAny(bw, 'payload_hashes', payloadHashes)
}
