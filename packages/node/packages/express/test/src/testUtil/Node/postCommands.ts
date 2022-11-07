import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'

export const postCommandsToArchive = async (
  commands: XyoBoundWitness[],
  archive: string,
  token?: string,
  expectedStatus: StatusCodes = StatusCodes.ACCEPTED,
): Promise<string[][]> => {
  const path = `/${archive}`
  const response = token
    ? await (await request()).post(path).send(commands).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).post(path).send(commands).expect(expectedStatus)
  return response.body.data
}
