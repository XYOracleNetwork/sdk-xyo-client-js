import { getExistingUser, getNewUser, signInUser, TestWeb3User } from '@xyo-network/express-node-test'

const verifySignIn = async (user: TestWeb3User) => {
  const token = await signInUser(user)
  expect(token).not.toBeNull()
  expect(token).not.toEqual('')
}

describe('Web3AuthStrategy', () => {
  it('Can sign-in existing user', async () => {
    await verifySignIn(await getExistingUser())
  })
  it('Successful sign-in creates user if they do not already exist', async () => {
    await verifySignIn(await getNewUser())
  })
})
