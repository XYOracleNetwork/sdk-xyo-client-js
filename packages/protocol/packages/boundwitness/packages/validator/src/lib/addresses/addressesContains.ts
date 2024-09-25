import type { Address } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'

import { boundWitnessContainsValue } from '../util/index.ts'

/**
 * Checks if the boundwitness contains the addresses
 * @param bw The boundwitness to check
 * @param addresses The address to check for
 * @returns True if the boundwitness contains the addresses
 */
export const addressesContains = (bw: BoundWitness, address: Address): boolean => {
  return boundWitnessContainsValue(bw, 'addresses', address)
}
