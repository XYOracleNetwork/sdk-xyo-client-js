import { trimAddressPrefix } from './trimAddressPrefix'

export const normalizeAddress = (address: string) => {
  return trimAddressPrefix(address.toLowerCase())
}
