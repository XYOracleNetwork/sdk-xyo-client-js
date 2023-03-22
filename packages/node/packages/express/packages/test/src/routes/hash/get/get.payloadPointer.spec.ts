import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  BoundWitnessWithPartialMeta,
  PayloadPointerPayload,
  PayloadPointerSchema,
  PayloadRule,
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
  getNewBoundWitness,
  insertBlock,
  insertPayload,
  otherUnitTestSigningAccount,
  unitTestSigningAccount,
} from '../../../testUtil'

const getPayloadPointer = (schema: string, timestamp = Date.now(), direction: SortDirection = 'desc', address?: string): Payload => {
  const schemaRule: PayloadSchemaRule = { schema }
  const timestampRule: PayloadTimestampDirectionRule = { direction, timestamp }
  const reference: PayloadRule[][] = [[schemaRule], [timestampRule]]
  if (address) reference.push([{ address }])
  return new PayloadBuilder<PayloadPointerPayload>({ schema: PayloadPointerSchema }).fields({ reference }).build()
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
    // Create data pointer will reference
    const [bw, payloads] = getNewBoundWitness(account)
    block = bw
    payload = PayloadWrapper.parse(assertEx(payloads?.[0])).body
    const blockResponse = await insertBlock(block, account)
    expect(blockResponse.length).toBe(2)
    const payloadResponse = await insertPayload(payloads, account)
    expect(payloadResponse.length).toBe(2)
    // Create pointer to reference data
    const pointer = getPayloadPointer(payload.schema)
    const pointerResponse = await insertPayload(pointer, account)
    expect(pointerResponse.length).toBe(2)
    pointerHash = PayloadWrapper.hash(pointer)
  })
  describe('return format is', () => {
    it('a single payload', async () => {
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      expect(response.schema).toEqual(payload.schema)
      expect(PayloadWrapper.parse(response).valid).toBeTrue()
      expect(response).toEqual(payload)
    })
  })
  describe('with existing payload pointer hash', () => {
    it('returns the referenced payload', async () => {
      const result = await getHash(pointerHash)
      expect(result).toBeTruthy()
    })
  })
  describe('with nonexistent payload pointer hash', () => {
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
