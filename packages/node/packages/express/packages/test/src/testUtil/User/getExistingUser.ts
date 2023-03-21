import { StatusCodes } from 'http-status-codes'

import { TestWeb3User } from '../Model'
import { getRequestClient } from '../Server'
import { getNewUser } from './getNewUser'

export const getExistingUser = async (expectedStatus: StatusCodes = StatusCodes.CREATED): Promise<TestWeb3User> => {
  const apiKey = process.env.API_KEY as string
  const user = getNewUser()
  const client = getRequestClient()
  const path = '/user/signup'
  const data = { address: user.address }
  const config = { headers: { 'x-api-key': apiKey } }
  const response = await client.post(path, data, config)
  expect(response.status).toBe(expectedStatus)
  return user
}
