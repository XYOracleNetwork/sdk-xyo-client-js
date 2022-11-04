import { XyoArchiveKey } from '@xyo-network/api'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getArchiveKeys = async (token: string, archive: string, expectedStatus: StatusCodes = StatusCodes.OK): Promise<XyoArchiveKey[]> => {
  const response = await (await request()).get(`/archive/${archive}/settings/key`).auth(token, { type: 'bearer' }).expect(expectedStatus)
  return response.body.data
}
