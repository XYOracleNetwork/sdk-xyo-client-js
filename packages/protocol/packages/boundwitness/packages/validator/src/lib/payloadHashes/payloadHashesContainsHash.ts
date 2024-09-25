import type { Hash } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'

import { boundWitnessContainsValue } from '../util/index.ts'

/**
 * Checks if the boundwitness contains the payload hash
 * @param bw The boundwitness to check
 * @param payloadHash The payload hash to check for
 * @returns True if the boundwitness contains the payload hash
 */
export const payloadHashesContainsHash = (bw: BoundWitness, payloadHash: Hash): boolean => {
  return boundWitnessContainsValue(bw, 'payload_hashes', payloadHash)
}
