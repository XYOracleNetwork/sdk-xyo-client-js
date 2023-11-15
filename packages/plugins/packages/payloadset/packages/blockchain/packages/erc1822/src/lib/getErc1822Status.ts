import { BaseProvider } from '@ethersproject/providers'
import { BigNumber } from '@xylabs/bignumber'
import { Address } from '@xyo-network/address'

export const ERC1822_PROXY_LOGIC_SLOT = '0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7'

export interface Erc1822DataSlots {
  implementation?: Address
}

export interface Erc1822Status {
  address: Address
  implementation: Address
  slots: Erc1822DataSlots
}

const hexBytesOnlyOnly = (value: string) => {
  return value.startsWith('0x') ? value.substring(2) : value
}

const addressFromHex = (value: string) => {
  return `0x${hexBytesOnlyOnly(value).substring(24)}`
}

const isHexZero = (value?: string) => {
  return value === undefined ? true : new BigNumber(hexBytesOnlyOnly(value), 'hex').eqn(0)
}

export const readAddressFromSlot = async (provider: BaseProvider, address: string, slot: string, block?: number) => {
  try {
    const slotValue = await provider.getStorageAt(address, slot, block)
    return addressFromHex(slotValue)
  } catch (ex) {
    return undefined
  }
}

export const getErc1822Status = async (provider: BaseProvider, address: string, block?: number): Promise<Erc1822Status> => {
  const status: Erc1822Status = {
    address,
    implementation: address,
    slots: {
      implementation: await readAddressFromSlot(provider, address, ERC1822_PROXY_LOGIC_SLOT, block),
    },
  }

  if (!isHexZero(status.slots.implementation)) {
    status.implementation = status.slots.implementation as string
  }

  return status
}
