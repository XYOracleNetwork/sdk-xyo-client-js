import { XyoArchive } from '@xyo-network/api'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'
import { getArchiveName } from './getArchiveName'

export const setArchiveAccessControl = async (
  token: string,
  archive: string,
  data: XyoArchive,
  expectedStatus: StatusCodes = StatusCodes.OK,
): Promise<XyoArchive> => {
  if (!archive) archive = getArchiveName()
  const response = await (
    await request()
  )
    .put(`/archive/${archive}`)
    .auth(token, { type: 'bearer' })
    .send({ accessControl: false, ...data, archive })
    .expect(expectedStatus)
  return response.body.data
}
