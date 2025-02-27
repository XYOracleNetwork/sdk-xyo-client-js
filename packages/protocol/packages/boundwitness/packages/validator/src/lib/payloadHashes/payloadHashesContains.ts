import { Hash } from '@xylabs/hex'
import { BoundWitness } from '@xyo-network/boundwitness-model'

import { boundWitnessArrayPropertyContains } from '../util/index.ts'

/**
 * Checks if the boundwitness contains the payload hash
 * @param bw The boundwitness to check
 * @param payloadHash The payload hash to check for
 * @returns True if the boundwitness contains the payload hash
 */
export const payloadHashesContains = (bw: BoundWitness, payloadHash: Hash): boolean => {
  return boundWitnessArrayPropertyContains(bw, 'payload_hashes', payloadHash)
}
