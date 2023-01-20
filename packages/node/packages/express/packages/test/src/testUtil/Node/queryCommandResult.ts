import { XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const queryCommandResult = async (
  id: string,
  token?: string,
  expectedStatus: StatusCodes = StatusCodes.ACCEPTED,
): Promise<XyoPayloadWithMeta> => {
  const path = `/query/${id}`
  const response = token
    ? await (await request()).get(path).redirects(1).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get(path).redirects(1).expect(expectedStatus)
  // Redirects to raw HURI response so no .data
  return response.body
}
