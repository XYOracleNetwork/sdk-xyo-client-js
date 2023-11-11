import { BaseProvider } from '@ethersproject/providers'
import { BigNumber } from '@xylabs/bignumber'

export const ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
export const ERC1967_PROXY_BEACON_STORAGE_SLOT = '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50'

export const readAddressFromSlot = async (provider: BaseProvider, address: string, slot: string, returnAddressAsDefault = false) => {
  const slotValue = await provider.getStorageAt(address, slot)
  const slotAddress = `${slotValue.substring(26)}`

  if (!returnAddressAsDefault) {
    return `0x${slotAddress}`
  } else {
    return new BigNumber(slotAddress, 'hex').eqn(0) ? address : `0x${slotAddress}`
  }
}
