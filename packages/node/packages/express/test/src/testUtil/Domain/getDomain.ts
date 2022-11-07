import { XyoDomainPayload } from '@xyo-network/domain-payload-plugin'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getDomain = async (domain: string, token?: string, expectedStatus: StatusCodes = StatusCodes.OK): Promise<XyoDomainPayload> => {
  const path = `/domain/${domain}`
  const response = token
    ? await (await request()).get(path).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get(path).expect(expectedStatus)
  return response.body.data
}
