import { Wallet } from '@ethersproject/wallet'
import { StatusCodes } from 'http-status-codes'

import { TestWeb3User } from '../Model'
import { getRequestClient } from '../Server'

export const signInUser = async (user: TestWeb3User): Promise<string> => {
  const client = getRequestClient()
  const challengeResponse = await client.post(`/account/${user.address}/challenge`, user)
  expect(challengeResponse.status).toBe(StatusCodes.OK)
  const state = challengeResponse.data.data.state
  const wallet = new Wallet(user.privateKey)
  const { address } = wallet
  const signature = await wallet.signMessage(state)
  const message = state
  const verifyBody = { address, message, signature }
  const tokenResponse = await client.post(`/account/${address}/verify`, verifyBody)
  expect(tokenResponse.status).toBe(StatusCodes.OK)
  const { token } = tokenResponse.data.data
  expect(token).toBeString()
  return token
}
