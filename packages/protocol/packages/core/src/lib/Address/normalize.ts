import { trimAddressPrefix } from './addressPrefix'

export const normalizeAddress = (address: string) => {
  return trimAddressPrefix(address.toLowerCase())
}
