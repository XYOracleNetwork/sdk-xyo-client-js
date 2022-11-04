import { XyoArchiveKey } from '@xyo-network/api'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const createArchiveKey = async (token: string, archive: string, expectedStatus: StatusCodes = StatusCodes.OK): Promise<XyoArchiveKey> => {
  const response = await (await request()).post(`/archive/${archive}/settings/key`).auth(token, { type: 'bearer' }).expect(expectedStatus)
  return response.body.data
}
