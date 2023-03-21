import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ArchivistInsertQuery, ArchivistInsertQuerySchema, QueryBoundWitnessBuilder } from '@xyo-network/modules'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { StatusCodes } from 'http-status-codes'

import { unitTestSigningAccount } from '../Account'
import { getArchivist } from '../Archivist'
import { request } from '../Server'
import { getNewBlock } from './getNewBlock'

export const postBlock = async (
  boundWitnesses: BoundWitness | BoundWitness[],
  token?: string,
  expectedStatus: StatusCodes = StatusCodes.OK,
): Promise<BoundWitnessWithMeta[]> => {
  const bws = ([] as BoundWitness[]).concat(Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses])
  const payloads = bws.map((bw) => (bw as BoundWitnessWithMeta)?._payloads || []).flat()
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

export const insertBlock = async (
  boundWitnesses: BoundWitness | BoundWitness[] = getNewBlock(),
  account: AccountInstance = unitTestSigningAccount,
): Promise<BoundWitness[]> => {
  const archivist = await getArchivist(account)
  const payloads = Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses]
  return archivist.insert(payloads)
}
