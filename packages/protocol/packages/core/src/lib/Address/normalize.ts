import { trimAddressPrefix } from './trim'

export const normalizeAddress = (address: string) => {
  return trimAddressPrefix(address.toLowerCase())
}
