import { unitTestSigningAccount } from '../Account'
import { TestWeb3User } from '../Model'

export const getUnitTestUser = (): TestWeb3User => {
  const account = unitTestSigningAccount
  const user = {
    address: account.addressValue.hex,
    privateKey: account.private.hex,
  }
  return user
}
