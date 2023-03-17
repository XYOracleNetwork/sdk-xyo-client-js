import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getRecentBlocks = async (
  archive: string,
  token?: string,
  expectedStatus: StatusCodes = StatusCodes.OK,
): Promise<BoundWitnessWithMeta[]> => {
  const path = `/archive/${archive}/block/recent`
  const response = token
    ? await (await request()).get(path).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get(path).expect(expectedStatus)
  return response.body.data
}
