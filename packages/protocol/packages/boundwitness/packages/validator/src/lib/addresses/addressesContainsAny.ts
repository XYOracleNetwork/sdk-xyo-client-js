import type { Address } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'

/**
 * Checks if the boundwitness contains any of the addresses
 * @param bw The boundwitness to check
 * @param addresses The addresses to check for
 * @returns True if the boundwitness contains all the addresses
 */
export const addressesContainsAny = (bw: BoundWitness, addresses: Address[]): boolean => {
  return addresses.some(address => bw.addresses?.includes(address))
}
