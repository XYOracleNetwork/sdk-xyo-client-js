import { XyoArchive } from '@xyo-network/api'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getArchive = async (archive: string, token?: string, expectedStatus: StatusCodes = StatusCodes.OK): Promise<XyoArchive> => {
  const path = `/archive/${archive}`
  const response = token
    ? await (await request()).get(path).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get(path).expect(expectedStatus)
  return response.body.data
}
