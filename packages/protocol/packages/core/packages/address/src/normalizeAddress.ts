/* eslint-disable import/no-deprecated */
import { trimAddressPrefix } from './trimAddressPrefix'

/** @deprecated use @xylabs/hex asHex instead */
export const normalizeAddress = (address: string) => {
  return trimAddressPrefix(address.toLowerCase())
}
