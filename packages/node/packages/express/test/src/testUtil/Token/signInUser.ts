import { Wallet } from '@ethersproject/wallet'
import { StatusCodes } from 'http-status-codes'

import { TestWeb2User, TestWeb3User } from '../Model'
import { request } from '../Server'

export const signInUser = async (user: TestWeb3User): Promise<string> => {
  const challengeResponse = await (await request()).post(`/account/${user.address}/challenge`).send(user).expect(StatusCodes.OK)
  const { state } = challengeResponse.body.data
  const wallet = new Wallet(user.privateKey)
  const signature = await wallet.signMessage(state)
  const verifyBody = {
    address: wallet.address,
    message: state,
    signature,
  }
  const tokenResponse = await (await request()).post(`/account/${wallet.address}/verify`).send(verifyBody).expect(StatusCodes.OK)
  return tokenResponse.body.data.token
}

/**
 * @deprecated Use signInUser instead
 */
export const signInWeb2User = async (user: TestWeb2User): Promise<string> => {
  const tokenResponse = await (await request()).post('/user/login').send(user).expect(StatusCodes.OK)
  return tokenResponse.body.data.token
}
