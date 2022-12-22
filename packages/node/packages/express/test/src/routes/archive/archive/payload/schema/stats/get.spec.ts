import { delay } from '@xylabs/delay'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'
import { StatusCodes } from 'http-status-codes'

import { claimArchive, getSchemaName, getTokenForUnitTestUser, postBlock, request, unitTestSigningAccount } from '../../../../../../testUtil'

const count = 2
const definition = { $schema: 'http://json-schema.org/draft-07/schema#' }

const getNewBlockWithPayloadsOfSchemaType = (schema = getSchemaName()) => {
  return new BoundWitnessBuilder({ inlinePayloads: true })
    .payload({ definition, schema } as XyoSchemaPayload)
    .witness(unitTestSigningAccount)
    .build()
}

describe('/archive/:archive/payload/schema/stats', () => {
  let token = ''
  let archive = ''
  let otherArchive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
    otherArchive = (await claimArchive(token)).archive

    // NOTE: POST in parallel to speed up test
    const posted = [
      // POST Payloads to test archive
      new Array(count).fill(null).map(async () => {
        const [block] = getNewBlockWithPayloadsOfSchemaType()
        const response = await postBlock(block, archive)
        expect(response.length).toBe(1)
      }),
      // Post some payloads to another archive
      new Array(count).fill(null).map(async () => {
        const [block] = getNewBlockWithPayloadsOfSchemaType()
        const response = await postBlock(block, otherArchive)
        expect(response.length).toBe(1)
      }),
    ]
    await Promise.all(posted.flatMap((p) => p))
    await delay(1000)
  })
  it('Returns stats on all payload schemas in archive', async () => {
    const response = await (await request()).get(`/archive/${archive}/payload/schema/stats`).expect(StatusCodes.OK)
    const stats = response.body.data
    expect(stats).toBeTruthy()
    expect(stats.counts).toBeTruthy()
    expect(typeof stats.counts).toBe('object')
    const { counts } = stats
    const schemas = Object.keys(counts)
    expect(schemas).toBeTruthy()
    expect(schemas.length).toBe(count)
    schemas.forEach((schema) => {
      expect(counts[schema]).toBe(1)
    })
  })
})
