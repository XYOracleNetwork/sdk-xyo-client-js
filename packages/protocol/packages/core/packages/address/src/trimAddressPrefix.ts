/** @deprecated use @xylabs/hex instead */
export const addressPrefix = '0x'

// NOTE: To prevent calling `.length` on every invocation, we cache the length
// but do want to tether it to the length of the actual prefix so it's not some
// magic number.
const addressPrefixLength = addressPrefix.length

/** @deprecated use @xylabs/hex asHex instead */
export const trimAddressPrefix = (address: string) => {
  return address.toLowerCase().startsWith(addressPrefix) ? address.slice(Math.max(0, addressPrefixLength)) : address
}
