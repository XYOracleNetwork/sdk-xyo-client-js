import { SortDirection, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getPayloadsByTimestamp = async (
  token: string,
  archive: string,
  timestamp: number,
  limit = 10,
  order: SortDirection = 'asc',
  expectedStatus: StatusCodes = StatusCodes.OK,
): Promise<XyoPayloadWithMeta[]> => {
  const response = await (await request())
    .get(`/archive/${archive}/payload`)
    .query({ limit, order, timestamp })
    .auth(token, { type: 'bearer' })
    .expect(expectedStatus)
  return response.body.data
}
