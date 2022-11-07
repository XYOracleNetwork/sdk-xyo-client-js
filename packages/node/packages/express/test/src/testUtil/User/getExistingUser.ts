/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */

import { StatusCodes } from 'http-status-codes'

import { TestWeb2User, TestWeb3User } from '../Model'
import { request } from '../Server'
import { getNewUser, getNewWeb2User } from './getNewUser'

export const getExistingUser = async (expectedStatus: StatusCodes = StatusCodes.CREATED): Promise<TestWeb3User> => {
  const apiKey = process.env.API_KEY as string
  const user = getNewUser()
  await (await request()).post('/user/signup').set('x-api-key', apiKey).send({ address: user.address }).expect(expectedStatus)
  return user
}

/**
 * @deprecated Use getExistingUser instead
 */
export const getExistingWeb2User = async (
  user: TestWeb2User = getNewWeb2User(),
  expectedStatus: StatusCodes = StatusCodes.CREATED,
): Promise<TestWeb2User> => {
  const apiKey = process.env.API_KEY as string
  await (await request()).post('/user/signup').set('x-api-key', apiKey).send(user).expect(expectedStatus)
  return user
}
