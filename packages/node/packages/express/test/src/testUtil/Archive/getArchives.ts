import { XyoArchive } from '@xyo-network/api'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getArchives = async (token?: string, expectedStatus: StatusCodes = StatusCodes.OK): Promise<XyoArchive[]> => {
  const response = token
    ? await (await request()).get('/archive').auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get('/archive').expect(expectedStatus)
  return response.body.data
}
