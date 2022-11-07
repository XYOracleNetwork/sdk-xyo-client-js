import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { utils } from 'ethers'

export const verifyWallet = (message: string, signature: string, address: string) => {
  try {
    const signingAddress = trimAddressPrefix(utils.verifyMessage(message, signature).toLowerCase())
    const walletAddress = trimAddressPrefix(address.toLowerCase())
    return signingAddress === walletAddress
  } catch (error) {
    return false
  }
}
