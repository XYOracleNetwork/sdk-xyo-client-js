import { assertEx } from '@xylabs/assert'
import {
  BoundWitnessWithPartialMeta,
  PayloadArchiveRule,
  PayloadPointerBody,
  payloadPointerSchema,
  PayloadSchemaRule,
  PayloadTimestampDirectionRule,
  SortDirection,
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import {
  getArchiveName,
  getHash,
  getNewBlock,
  getNewBlockWithPayloads,
  getTokenForOtherUnitTestUser,
  getTokenForUnitTestUser,
  otherUnitTestSigningAccount,
  postBlock,
  unitTestSigningAccount,
} from '../../../testUtil'

const getPayloadPointer = (archive: string, schema: string, timestamp = Date.now(), direction: SortDirection = 'desc', address?: string): Payload => {
  const archiveRule: PayloadArchiveRule = { archive }
  const schemaRule: PayloadSchemaRule = { schema }
  const timestampRule: PayloadTimestampDirectionRule = { direction, timestamp }
  const fields: PayloadPointerBody = { reference: [[archiveRule], [schemaRule], [timestampRule]], schema: payloadPointerSchema }
  if (address) fields.reference.push([{ address }])
  return new PayloadBuilder<PayloadPointerBody>({ schema: payloadPointerSchema }).fields(fields).build()
}

describe('/:hash', () => {
  let ownerToken: string
  let otherUserToken: string
  let archive: string
  let block: BoundWitnessWithPartialMeta
  let payload: Payload
  let pointerHash: string
  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation()
    ownerToken = await getTokenForUnitTestUser()
    otherUserToken = await getTokenForOtherUnitTestUser()
  })
  beforeEach(async () => {
    archive = getArchiveName()
    block = getNewBlockWithPayloads(1)
    payload = PayloadWrapper.parse(assertEx(block._payloads?.[0])).body
    const blockResponse = await postBlock(block, archive)
    expect(blockResponse.length).toBe(2)
    const pointer = getPayloadPointer(archive, payload.schema)
    const pointerResponse = await postBlock(getNewBlock(pointer), archive)
    expect(pointerResponse.length).toBe(2)
    pointerHash = pointerResponse[0].payload_hashes[0]
  })
  describe('return format is', () => {
    it('a single payload', async () => {
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      expect(response.schema).toEqual(payload?.schema)
      expect(response).toEqual(payload)
    })
  })
  describe('with public archive', () => {
    it('with anonymous user returns the payload', async () => {
      await getHash(pointerHash, undefined)
    })
    it('with non-archive owner returns the payload', async () => {
      await getHash(pointerHash, otherUserToken)
    })
    it('with archive owner returns the payload', async () => {
      const result = await getHash(pointerHash, ownerToken)
      expect(result).toBeTruthy()
    })
  })
  describe('with nonexistent hash', () => {
    it(`returns ${ReasonPhrases.NOT_FOUND}`, async () => {
      await getHash('non_existent_hash', undefined, StatusCodes.NOT_FOUND)
    })
  })
  describe('with signer address', () => {
    it('returns only payloads signed by the address', async () => {
      const account = unitTestSigningAccount
      const pointer = getPayloadPointer(archive, payload.schema, Date.now(), 'desc', account.addressValue.hex)
      const pointerResponse = await postBlock(getNewBlock(pointer), archive)
      expect(pointerResponse.length).toBe(2)
      pointerHash = pointerResponse[0].payload_hashes[0]
      const result = await getHash(pointerHash, ownerToken)
      expect(result).toBeTruthy()
    })
  })
  it('returns no payloads if not signed by address', async () => {
    const pointer = getPayloadPointer(archive, payload.schema, Date.now(), 'desc', otherUnitTestSigningAccount.addressValue.hex)
    const pointerResponse = await postBlock(getNewBlock(pointer), archive)
    expect(pointerResponse.length).toBe(2)
    pointerHash = pointerResponse[0].payload_hashes[0]
    await getHash(pointerHash, ownerToken, StatusCodes.NOT_FOUND)
  })
})
