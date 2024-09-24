import type { Address } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'

/**
 * Checks if the boundwitness contains any of the addresses. If the addresses array
 * is empty, it will return true. This is to match the behavior or addressesContainsAll
 * which will return true if the addresses array is empty.
 * @param bw The boundwitness to check
 * @param addresses The addresses to check for
 * @returns True if the boundwitness contains any of the addresses
 */
export const addressesContainsAny = (bw: BoundWitness, addresses: Address[]): boolean => {
  if (addresses.length === 0) return true
  return addresses.some(address => bw.addresses?.includes(address))
}
