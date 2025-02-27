import { Address } from '@xylabs/hex'
import { BoundWitness } from '@xyo-network/boundwitness-model'

import { boundWitnessArrayPropertyContains } from '../util/index.ts'

/**
 * Checks if the boundwitness contains the addresses
 * @param bw The boundwitness to check
 * @param addresses The address to check for
 * @returns True if the boundwitness contains the addresses
 */
export const addressesContains = (bw: BoundWitness, address: Address): boolean => {
  return boundWitnessArrayPropertyContains(bw, 'addresses', address)
}
