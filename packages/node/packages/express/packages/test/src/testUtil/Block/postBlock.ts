import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ArchivistInsertQuery, ArchivistInsertQuerySchema, QueryBoundWitnessBuilder } from '@xyo-network/modules'
import { XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { StatusCodes } from 'http-status-codes'

import { request } from '../Server'
export const postBlock = async (
  boundWitnesses: XyoBoundWitness | XyoBoundWitness[],
  archive: string,
  token?: string,
  expectedStatus: StatusCodes = StatusCodes.OK,
): Promise<XyoBoundWitnessWithMeta[]> => {
  const bws = ([] as XyoBoundWitness[]).concat(Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses])
  const payloads = bws.map((bw) => (bw as XyoBoundWitnessWithMeta)?._payloads || []).flat()
  const insertions = [...bws, ...payloads]
  const queryPayload = PayloadWrapper.parse<ArchivistInsertQuery>({
    payloads: insertions.map((payload) => PayloadWrapper.hash(payload)),
    schema: ArchivistInsertQuerySchema,
  })
  const builder = new QueryBoundWitnessBuilder().payloads(insertions).query(queryPayload)
  const data = builder.build()
  const path = '/Archivist'
  const response = token
    ? await (await request()).post(path).auth(token, { type: 'bearer' }).send(data).expect(expectedStatus)
    : await (await request()).post(path).send(data).expect(expectedStatus)
  return response.body.data
}
