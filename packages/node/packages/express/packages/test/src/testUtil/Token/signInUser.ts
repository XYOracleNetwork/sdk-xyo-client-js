import { Wallet } from '@ethersproject/wallet'
import { StatusCodes } from 'http-status-codes'

import { TestWeb3User } from '../Model'
import { getRequestClient } from '../Server'

export const signInUser = async (user: TestWeb3User): Promise<string> => {
  const client = getRequestClient()
  const challengeResponse = await client.post(`/account/${user.address}/challenge`, user)
  expect(challengeResponse.status).toBe(StatusCodes.OK)
  const { state } = challengeResponse.data
  const wallet = new Wallet(user.privateKey)
  const signature = await wallet.signMessage(state)
  const verifyBody = { address: wallet.address, message: state, signature }
  const tokenResponse = await client.post(`/account/${wallet.address}/verify`, verifyBody)
  expect(tokenResponse.status).toBe(StatusCodes.OK)
  const { token } = tokenResponse.data
  expect(token).toBeString()
  return token
}
