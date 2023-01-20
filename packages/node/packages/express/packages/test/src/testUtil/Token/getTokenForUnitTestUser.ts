import { unitTestSigningAccount } from '../Account'
import { TestWeb3User } from '../Model'
import { signInUser } from './signInUser'

let token: string | undefined = undefined

export const getTokenForUnitTestUser = async (): Promise<string> => {
  if (token) return token
  const account = unitTestSigningAccount
  const user: TestWeb3User = {
    address: account.addressValue.hex,
    privateKey: account.private.hex,
  }
  token = await signInUser(user)
  return token
}
