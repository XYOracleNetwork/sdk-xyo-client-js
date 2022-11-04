import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const getSchema = async (schema: string, token?: string, expectedStatus: StatusCodes = StatusCodes.OK): Promise<XyoSchemaPayload> => {
  const path = `/schema/${schema}`
  const response = token
    ? await (await request()).get(path).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get(path).expect(expectedStatus)
  return response.body.data
}
