import { StatusCodes } from 'http-status-codes'

import { TestWeb3User } from '../Model'
import { request } from '../Server'
import { getNewUser } from './getNewUser'

export const getExistingUser = async (expectedStatus: StatusCodes = StatusCodes.CREATED): Promise<TestWeb3User> => {
  const apiKey = process.env.API_KEY as string
  const user = getNewUser()
  await (await request()).post('/user/signup').set('x-api-key', apiKey).send({ address: user.address }).expect(expectedStatus)
  return user
}
