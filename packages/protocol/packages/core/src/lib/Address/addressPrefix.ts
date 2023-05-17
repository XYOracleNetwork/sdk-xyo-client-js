export const addressPrefix = '0x'

// NOTE: To prevent calling `.length` on every invocation, we cache the length
// but do want to tether it to the length of the actual prefix so it's not some
// magic number.
const addressPrefixLength = addressPrefix.length

export const trimAddressPrefix = (address: string) => {
  return address.toLowerCase().startsWith(addressPrefix) ? address.substring(addressPrefixLength) : address
}
