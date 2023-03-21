import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  BoundWitnessWithPartialMeta,
  PayloadPointerBody,
  PayloadPointerSchema,
  PayloadSchemaRule,
  PayloadTimestampDirectionRule,
  SortDirection,
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { ReasonPhrases } from 'http-status-codes'

import {
  getHash,
  getNewBlock,
  getNewBlockWithPayloads,
  insertBlock,
  insertPayload,
  otherUnitTestSigningAccount,
  unitTestSigningAccount,
} from '../../../testUtil'

const getPayloadPointer = (schema: string, timestamp = Date.now(), direction: SortDirection = 'desc', address?: string): Payload => {
  const schemaRule: PayloadSchemaRule = { schema }
  const timestampRule: PayloadTimestampDirectionRule = { direction, timestamp }
  const fields: PayloadPointerBody = { reference: [[schemaRule], [timestampRule]], schema: PayloadPointerSchema }
  if (address) fields.reference.push([{ address }])
  return new PayloadBuilder<PayloadPointerBody>({ schema: PayloadPointerSchema }).fields(fields).build()
}

describe('/:hash', () => {
  let block: BoundWitnessWithPartialMeta
  let payload: Payload
  let pointerHash: string
  const account = Account.random()
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation()
  })
  beforeEach(async () => {
    block = getNewBlockWithPayloads(1)
    payload = PayloadWrapper.parse(assertEx(block._payloads?.[0])).body
    const blockResponse = await insertBlock(block)
    expect(blockResponse.length).toBe(2)
    const payloadResponse = await insertPayload(block._payloads)
    expect(payloadResponse.length).toBe(2)
    const pointer = getPayloadPointer(payload.schema)
    const pointerResponse = await insertBlock(getNewBlock(pointer), account)
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
      await getHash(pointerHash)
    })
    it('with non-archive owner returns the payload', async () => {
      await getHash(pointerHash)
    })
    it('with archive owner returns the payload', async () => {
      const result = await getHash(pointerHash)
      expect(result).toBeTruthy()
    })
  })
  describe('with nonexistent hash', () => {
    it(`returns ${ReasonPhrases.NOT_FOUND}`, async () => {
      const result = await getHash('non_existent_hash')
      const error = result as unknown as { errors: { detail: string; status: string }[] }
      expect(error.errors).toBeArrayOfSize(1)
      expect(error.errors[0]).toEqual({
        detail: 'Hash not found',
        status: '404',
      })
    })
  })
  describe('with signer address', () => {
    it('returns only payloads signed by the address', async () => {
      const account = unitTestSigningAccount
      const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
      const pointerResponse = await insertBlock(getNewBlock(pointer), account)
      expect(pointerResponse.length).toBe(2)
      pointerHash = pointerResponse[0].payload_hashes[0]
      const result = await getHash(pointerHash)
      expect(result).toBeTruthy()
    })
  })
  it('returns no payloads if not signed by address', async () => {
    const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', otherUnitTestSigningAccount.addressValue.hex)
    const pointerResponse = await insertBlock(getNewBlock(pointer), account)
    expect(pointerResponse.length).toBe(2)
    pointerHash = pointerResponse[0].payload_hashes[0]
    const result = await getHash(pointerHash)
    expect(result).toBeObject()
    const error = result as unknown as { errors: { detail: string; status: string }[] }
    expect(error.errors).toBeArrayOfSize(1)
    expect(error.errors[0]).toEqual({
      detail: 'Hash not found',
      status: '404',
    })
  })
})
