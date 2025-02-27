import { Hash } from '@xylabs/hex'
import { BoundWitness } from '@xyo-network/boundwitness-model'

import { boundWitnessArrayPropertyContainsAll } from '../util/index.ts'

/**
 * Checks if the boundwitness contains all of the payload hashes
 * @param bw The boundwitness to check
 * @param payloadHashes The payload hashes to check for
 * @returns True if the boundwitness contains all of the payload hashes
 */
export const payloadHashesContainsAll = (bw: BoundWitness, payloadHashes: Hash[]): boolean => {
  return boundWitnessArrayPropertyContainsAll(bw, 'payload_hashes', payloadHashes)
}
