import { verifyMessage } from '@ethersproject/wallet'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'

export const verifyWallet = (message: string, signature: string, address: string) => {
  try {
    const signingAddress = trimAddressPrefix(verifyMessage(message, signature).toLowerCase())
    const walletAddress = trimAddressPrefix(address.toLowerCase())
    return signingAddress === walletAddress
  } catch (error) {
    return false
  }
}
