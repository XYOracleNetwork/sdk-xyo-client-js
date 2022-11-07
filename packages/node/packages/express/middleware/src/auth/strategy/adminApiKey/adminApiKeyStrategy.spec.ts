/* eslint-disable deprecation/deprecation */
import { getExistingUser, getExistingWeb2User, getNewWeb2User } from '@xyo-network/express-node-test'
import { StatusCodes } from 'http-status-codes'

describe('/user/signup', () => {
  it('Creates a user with email/password', async () => {
    await getExistingWeb2User()
  })
  it('Creates a user with wallet address', async () => {
    await getExistingUser()
  })
  it('Updates an existing user', async () => {
    const user = await getExistingWeb2User()
    user.password = getNewWeb2User().password
    const actual = await getExistingWeb2User(user, StatusCodes.OK)
    expect(actual.email).toEqual(user.email)
  })
})
