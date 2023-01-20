import { XyoArchive } from '@xyo-network/api'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'
import { getArchiveName } from './getArchiveName'

export const claimArchive = async (token: string, archive?: string, expectedStatus: StatusCodes = StatusCodes.CREATED): Promise<XyoArchive> => {
  if (!archive) archive = getArchiveName()
  const response = await (await request()).put(`/archive/${archive}`).auth(token, { type: 'bearer' }).expect(expectedStatus)
  return response.body.data
}
