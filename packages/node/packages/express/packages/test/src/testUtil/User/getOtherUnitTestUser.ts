import { otherUnitTestSigningAccount } from '../Account'
import { TestWeb3User } from '../Model'

export const getOtherUnitTestUser = (): TestWeb3User => {
  const account = otherUnitTestSigningAccount
  const user = {
    address: account.addressValue.hex,
    privateKey: account.private.hex,
  }
  return user
}
