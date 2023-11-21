export const addressPrefix = '0x'

export const hasAddressPrefix = (address: string): boolean => {
  return address.toLowerCase().startsWith(addressPrefix)
}

export const addAddressPrefix = (address: string): string => {
  return hasAddressPrefix(address) ? address : addressPrefix.concat(address)
}

export const trimAddressPrefix = (address: string): string => {
  return hasAddressPrefix(address) ? address.substring(2) : address
}
