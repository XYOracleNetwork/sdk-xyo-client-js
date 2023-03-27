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
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { getHash, getNewBlock, getNewBoundWitness, insertBlock, insertPayload, unitTestSigningAccount } from '../../../testUtil'

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
  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation()
    // Create data pointer will reference
    const [bw, payloads] = getNewBoundWitness([account])
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
    beforeAll(async () => {
      // Create data pointer will reference
      const [bw, payloads] = getNewBoundWitness([account])
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
    it('a single payload matching the pointer criteria', async () => {
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      expect(response.schema).toEqual(payload.schema)
      expect(PayloadWrapper.parse(response).valid).toBeTrue()
      expect(response).toEqual(payload)
    })
    it(`${ReasonPhrases.NOT_FOUND} if no payloads match the criteria`, async () => {
      const result = await getHash('non_existent_hash')
      const error = result as unknown as { errors: { detail: string; status: string }[] }
      expect(error.errors).toBeArrayOfSize(1)
      expect(error.errors[0]).toEqual({
        detail: 'Hash not found',
        status: `${StatusCodes.NOT_FOUND}`,
      })
    })
  })
  describe('with rules for', () => {
    describe('address', () => {
      describe('single address', () => {
        it('returns payload signed by address', async () => {
          const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
          const pointerResponse = await insertBlock(getNewBlock(pointer), account)
          expect(pointerResponse.length).toBe(2)
          const pointerHash = pointerResponse[0].payload_hashes[0]
          const result = await getHash(pointerHash)
          expect(result).toBeTruthy()
        })
      })
      describe('multiple address rules', () => {
        describe('combined serially', () => {
          it('returns payload signed by addresses', async () => {
            const account = unitTestSigningAccount
            const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
            const pointerResponse = await insertBlock(getNewBlock(pointer), account)
            expect(pointerResponse.length).toBe(2)
            const pointerHash = pointerResponse[0].payload_hashes[0]
            const result = await getHash(pointerHash)
            expect(result).toBeTruthy()
          })
        })
        describe('combined in parallel', () => {
          it('returns payload signed by either address', async () => {
            const account = unitTestSigningAccount
            const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
            const pointerResponse = await insertBlock(getNewBlock(pointer), account)
            expect(pointerResponse.length).toBe(2)
            const pointerHash = pointerResponse[0].payload_hashes[0]
            const result = await getHash(pointerHash)
            expect(result).toBeTruthy()
          })
        })
      })
      it('no matching address', async () => {
        const account = Account.random()
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeObject()
        const error = result as unknown as { errors: { detail: string; status: string }[] }
        expect(error.errors).toBeArrayOfSize(1)
        expect(error.errors[0]).toEqual({
          detail: 'Hash not found',
          status: `${StatusCodes.NOT_FOUND}`,
        })
      })
    })
    describe('schema', () => {
      beforeAll(async () => {
        // Create data pointer will reference
        const [bw, payloads] = getNewBoundWitness([account])
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
      it('single schema', async () => {
        const account = unitTestSigningAccount
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeTruthy()
      })
      it('multiple schemas', async () => {
        const account = unitTestSigningAccount
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeTruthy()
      })
      it('no matching schema', async () => {
        const account = Account.random()
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeObject()
        const error = result as unknown as { errors: { detail: string; status: string }[] }
        expect(error.errors).toBeArrayOfSize(1)
        expect(error.errors[0]).toEqual({
          detail: 'Hash not found',
          status: `${StatusCodes.NOT_FOUND}`,
        })
      })
    })
    describe.skip('timestamp direction', () => {
      beforeAll(async () => {
        // Create data pointer will reference
        const [bw, payloads] = getNewBoundWitness([account])
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
      it('ascending', async () => {
        const account = unitTestSigningAccount
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeTruthy()
      })
      it('descending', async () => {
        const account = unitTestSigningAccount
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeTruthy()
      })
      it('no matching timestamp', async () => {
        const account = Account.random()
        const pointer = getPayloadPointer(payload.schema, Date.now(), 'desc', account.addressValue.hex)
        const pointerResponse = await insertBlock(getNewBlock(pointer), account)
        expect(pointerResponse.length).toBe(2)
        const pointerHash = pointerResponse[0].payload_hashes[0]
        const result = await getHash(pointerHash)
        expect(result).toBeObject()
        const error = result as unknown as { errors: { detail: string; status: string }[] }
        expect(error.errors).toBeArrayOfSize(1)
        expect(error.errors[0]).toEqual({
          detail: 'Hash not found',
          status: `${StatusCodes.NOT_FOUND}`,
        })
      })
    })
  })
})
