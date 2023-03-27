import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  BoundWitnessWithPartialMeta,
  PayloadAddressRule,
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

import {
  getHash,
  getNewBlock,
  getNewBoundWitness,
  insertBlock,
  insertPayload,
  otherUnitTestSigningAccount,
  unitTestSigningAccount,
} from '../../../testUtil'

const createPayloadPointer = async (
  addresses: string[][] = [],
  schemas: string[][] = [],
  timestamp = Date.now(),
  direction: SortDirection = 'desc',
): Promise<string> => {
  const reference: PayloadRule[][] = []

  const schemaRules: PayloadSchemaRule[][] = schemas.map((rules) => {
    return rules.map((schema) => {
      return { schema }
    })
  })
  if (schemaRules.length) reference.push(...schemaRules)

  const addressRules: PayloadAddressRule[][] = addresses.map((rules) => {
    return rules.map((address) => {
      return { address }
    })
  })
  if (addressRules.length) reference.push(...addressRules)

  const timestampRule: PayloadTimestampDirectionRule = { direction, timestamp }
  reference.push([timestampRule])

  const pointer = new PayloadBuilder<PayloadPointerPayload>({ schema: PayloadPointerSchema }).fields({ reference }).build()
  const pointerResponse = await insertBlock(getNewBlock(pointer), unitTestSigningAccount)
  expect(pointerResponse.length).toBe(2)
  const pointerHash = pointerResponse[0].payload_hashes[0]
  expect(pointerHash).toBeString()
  return pointerHash
}

describe('/:hash', () => {
  let block: BoundWitnessWithPartialMeta
  let payload: Payload
  let pointerHash: string
  const account = unitTestSigningAccount
  describe('return format is', () => {
    beforeAll(async () => {
      // Create data pointer will reference
      const [bw, payloads] = getNewBoundWitness()
      block = bw
      payload = PayloadWrapper.parse(assertEx(payloads?.[0])).body
      const blockResponse = await insertBlock(block, account)
      expect(blockResponse.length).toBe(2)
      const payloadResponse = await insertPayload(payloads, account)
      expect(payloadResponse.length).toBe(2)
      // Create pointer to reference data
      pointerHash = await createPayloadPointer([], [[payload.schema]])
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
        it.only('returns payload signed by address', async () => {
          const account = Account.random()
          const data = getNewBoundWitness([account])
          const payload = data[1][0]
          const blockResponse = await insertBlock(block, account)
          expect(blockResponse.length).toBe(2)
          const payloadResponse = await insertPayload(payload, account)
          expect(payloadResponse.length).toBe(2)
          const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[payload.schema]])
          const result = await getHash(pointerHash)
          expect(result).toBeTruthy()
          expect(result).toEqual(payload)
        })
      })
      describe('multiple address rules', () => {
        describe('combined serially', () => {
          it('returns payload signed by addresses', async () => {
            const accountA = unitTestSigningAccount
            const accountB = otherUnitTestSigningAccount
            const pointerHash = await createPayloadPointer([[accountA.addressValue.hex, accountB.addressValue.hex]])
            const result = await getHash(pointerHash)
            expect(result).toBeTruthy()
          })
        })
        describe('combined in parallel', () => {
          it('returns payload signed by either address', async () => {
            const accountA = unitTestSigningAccount
            const accountB = otherUnitTestSigningAccount
            const pointerHash = await createPayloadPointer([[accountA.addressValue.hex], [accountB.addressValue.hex]])
            const result = await getHash(pointerHash)
            expect(result).toBeTruthy()
          })
        })
      })
      it('no matching address', async () => {
        const account = Account.random()
        const pointerHash = await createPayloadPointer([[account.addressValue.hex]])
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
    describe.skip('schema', () => {
      // TODO: Match address rule tests shape
    })
    describe.skip('timestamp direction', () => {
      it('ascending', async () => {
        // TODO
      })
      it('descending', async () => {
        // TODO
      })
      it('no matching timestamp', async () => {
        const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [], Date.now(), 'asc')
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
  describe('with no rules', () => {
    it('is valid', () => {
      // TODO:
    })
  })
})
