import type { Address } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'

/**
 * Checks if the boundwitness contains all the addresses
 * @param bw The boundwitness to check
 * @param addresses The addresses to check for
 * @returns True if the boundwitness contains all the addresses
 */
export const addressesContainsAll = (bw: BoundWitness, addresses: Address[]): boolean => {
  return addresses.every(address => bw.addresses?.includes(address))
}
