import type { Address } from '@xylabs/sdk-js'

export const uniqueAddresses = (addresses: Address[], throwOnFalse = false) => {
  const addressesSet = new Set<Address>()
  for (const address of addresses) {
    if (addressesSet.has(address)) {
      if (throwOnFalse) {
        throw new Error('Duplicate address')
      }
      return false
    }
    addressesSet.add(address)
  }
  return true
}
