import { Wallet } from 'ethers'
import { v4 } from 'uuid'

import { TestWeb2User, TestWeb3User } from '../Model'

/**
 * @deprecated Use getNewUser instead
 */
export const getNewWeb2User = (): TestWeb2User => {
  const user = {
    email: `test-user-${v4()}@test.com`,
    password: 'password',
  }
  return user
}

export const getNewUser = (): TestWeb3User => {
  const wallet = Wallet.createRandom()
  const user = { address: wallet.address, privateKey: wallet.privateKey }
  return user
}
