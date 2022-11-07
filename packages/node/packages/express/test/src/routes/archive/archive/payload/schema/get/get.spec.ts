import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'
import { StatusCodes } from 'http-status-codes'

import {
  claimArchive,
  getSchemaName,
  getTokenForUnitTestUser,
  postBlock,
  request,
  testSchemaPrefix,
  unitTestSigningAccount,
} from '../../../../../../testUtil'

const blocksPosted = 2
const definition = { $schema: 'http://json-schema.org/draft-07/schema#' }

const getNewBlockWithPayloadsOfSchemaType = (schema = getSchemaName()) => {
  return new BoundWitnessBuilder({ inlinePayloads: true })
    .payload({ definition, schema } as XyoSchemaPayload)
    .witness(unitTestSigningAccount)
    .build()[0]
}

describe('/archive/:archive/payload/schema', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
    // Post blocks to one archive
    for (let blockCount = 0; blockCount < blocksPosted; blockCount++) {
      const block = getNewBlockWithPayloadsOfSchemaType()
      const blockResponse = await postBlock(block, archive)
      expect(blockResponse.length).toBe(1)
    }

    // Post blocks to another archive
    archive = (await claimArchive(token)).archive
    for (let blockCount = 0; blockCount < blocksPosted; blockCount++) {
      const block = getNewBlockWithPayloadsOfSchemaType()
      const blockResponse = await postBlock(block, archive)
      expect(blockResponse.length).toBe(1)
    }
  }, 25000)
  it('Returns payloads schemas used in archive', async () => {
    const response = await (await request()).get(`/archive/${archive}/payload/schema`).expect(StatusCodes.OK)
    const schemas = response.body.data as string[]
    expect(schemas).toBeTruthy()
    expect(Array.isArray(schemas)).toBeTruthy()
    expect(schemas.length).toBe(blocksPosted)
    schemas.forEach((schema) => {
      expect(schema.startsWith(testSchemaPrefix)).toBeTruthy()
    })
  })
  it('Returns empty array if no schemas exist in archive', async () => {
    const token = await getTokenForUnitTestUser()
    const archive = (await claimArchive(token)).archive
    const response = await (await request()).get(`/archive/${archive}/payload/schema`).expect(StatusCodes.OK)
    const schemas = response.body.data as string[]
    expect(schemas).toBeTruthy()
    expect(Array.isArray(schemas)).toBeTruthy()
    expect(schemas.length).toBe(0)
  })
})
