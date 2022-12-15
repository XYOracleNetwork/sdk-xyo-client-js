import { Wallet } from '@ethersproject/wallet'

import { TestWeb3User } from '../Model'

export const getNewUser = (): TestWeb3User => {
  const wallet = Wallet.createRandom()
  const user = { address: wallet.address, privateKey: wallet.privateKey }
  return user
}
