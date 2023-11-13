import { BaseProvider } from '@ethersproject/providers'
import { BigNumber } from '@xylabs/bignumber'
import { UpgradeableBeacon__factory } from '@xyo-network/open-zeppelin-typechain'

export const ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
export const ERC1967_PROXY_BEACON_STORAGE_SLOT = '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50'
export const ERC1967_PROXY_ADMIN_STORAGE_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
export const ERC1967_PROXY_ROLLBACK_STORAGE_SLOT = '0x4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143'

export interface Erc1967DataSlots {
  admin: string
  beacon: string
  implementation: string
  rollback: string
}

export interface Erc1967Status {
  address: string
  implementation: string
  proxy: Erc1967DataSlots
}

const hexBytesOnlyOnly = (value: string) => {
  return value.startsWith('0x') ? value.substring(2) : value
}

const addressFromHex = (value: string) => {
  return `0x${hexBytesOnlyOnly(value).substring(24)}`
}

const isHexZero = (value: string) => {
  return new BigNumber(hexBytesOnlyOnly(value), 'hex').eqn(0)
}

export const readAddressFromSlot = async (provider: BaseProvider, address: string, slot: string) => {
  const slotValue = await provider.getStorageAt(address, slot)
  return addressFromHex(slotValue)
}

export const getErc1967Status = async (provider: BaseProvider, address: string): Promise<Erc1967Status> => {
  const proxy: Erc1967DataSlots = {
    admin: await readAddressFromSlot(provider, address, ERC1967_PROXY_ADMIN_STORAGE_SLOT),
    beacon: await readAddressFromSlot(provider, address, ERC1967_PROXY_BEACON_STORAGE_SLOT),
    implementation: await readAddressFromSlot(provider, address, ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT),
    rollback: await readAddressFromSlot(provider, address, ERC1967_PROXY_ROLLBACK_STORAGE_SLOT),
  }

  if (!isHexZero(proxy.beacon)) {
    const beacon = UpgradeableBeacon__factory.connect(proxy.beacon, provider)
    try {
      proxy.implementation = await beacon.callStatic.implementation()
    } catch (ex) {
      const error = ex as Error
      console.log(error.message)
    }
  }

  return {
    address,
    implementation: isHexZero(proxy.implementation) ? address : proxy.implementation,
    proxy,
  }
}
