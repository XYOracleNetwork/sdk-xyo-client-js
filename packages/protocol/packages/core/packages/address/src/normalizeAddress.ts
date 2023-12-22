/* eslint-disable import/no-deprecated */
import { trimAddressPrefix } from './trimAddressPrefix'

/** @deprecated use @xylabs/hex hexFrom instead */
export const normalizeAddress = (address: string) => {
  return trimAddressPrefix(address.toLowerCase())
}
