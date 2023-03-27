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

import { getHash, getNewBoundWitness, getNewPayload, getTestSchemaName, insertBlock, insertPayload, unitTestSigningAccount } from '../../../testUtil'

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
  const pointerResponse = await insertPayload(pointer)
  expect(pointerResponse.length).toBe(2)
  expect(pointerResponse.map((bw) => bw.payload_schemas.includes(PayloadPointerSchema)).some((x) => x)).toBeTrue()
  return PayloadWrapper.hash(pointer)
}

const expectHashNotFound = (result: Payload) => {
  expect(result).toBeObject()
  const error = result as unknown as { errors: { detail: string; status: string }[] }
  expect(error.errors).toBeArrayOfSize(1)
  expect(error.errors[0]).toEqual({
    detail: 'Hash not found',
    status: `${StatusCodes.NOT_FOUND}`,
  })
}

describe('/:hash', () => {
  describe('return format is', () => {
    const account = Account.random()
    const [bw, payloads] = getNewBoundWitness([account])
    beforeAll(async () => {
      // Create data pointer will reference
      const blockResponse = await insertBlock(bw, account)
      expect(blockResponse.length).toBe(2)
      const payloadResponse = await insertPayload(payloads, account)
      expect(payloadResponse.length).toBe(2)
    })
    it('a single payload matching the pointer criteria', async () => {
      const expected = payloads[0]
      const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[expected.schema]])
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      expect(PayloadWrapper.parse(response).valid).toBeTrue()
      expect(response).toEqual(expected)
    })
    it(`${ReasonPhrases.NOT_FOUND} if no payloads match the criteria`, async () => {
      const result = await getHash('non_existent_hash')
      expectHashNotFound(result)
    })
  })
  describe('with rules for', () => {
    const accountA = Account.random()
    const accountB = Account.random()
    const accountC = Account.random()
    const accountD = Account.random()
    const [bwA, payloadsA] = getNewBoundWitness([accountA])
    const [bwB, payloadsB] = getNewBoundWitness([accountB])
    const [bwC, payloadsC] = getNewBoundWitness([accountC])
    const [bwD, payloadsD] = getNewBoundWitness([accountD])
    const [bwE, payloadsE] = getNewBoundWitness([accountC, accountD])
    const [bwF, payloadsF] = getNewBoundWitness([accountC])
    const [bwG, payloadsG] = getNewBoundWitness([accountD])
    const payloads = [...payloadsA, ...payloadsB, ...payloadsC, ...payloadsD, ...payloadsE, ...payloadsF, ...payloadsG]
    const boundWitnesses = [bwA, bwB, bwC, bwD, bwE, bwF, bwG]
    beforeAll(async () => {
      await insertPayload(payloads)
      await insertBlock(boundWitnesses)
    })
    describe('address', () => {
      describe('single address', () => {
        it.each([
          [accountA, payloadsA[0]],
          [accountB, payloadsB[0]],
        ])('returns payload signed by address', async (account, expected) => {
          const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[expected.schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('multiple address rules', () => {
        describe('combined serially', () => {
          it('returns payload signed by both addresses', async () => {
            const expected = payloadsE[0]
            const pointerHash = await createPayloadPointer([[accountC.addressValue.hex], [accountD.addressValue.hex]], [[expected.schema]])
            const result = await getHash(pointerHash)
            expect(result).toEqual(expected)
          })
        })
        describe('combined in parallel', () => {
          it('returns payload signed by both address', async () => {
            const expected = payloadsE[0]
            const pointerHash = await createPayloadPointer([[accountC.addressValue.hex, accountD.addressValue.hex]], [[expected.schema]])
            const result = await getHash(pointerHash)
            expect(result).toEqual(expected)
          })
        })
      })
      it('no matching address', async () => {
        const account = Account.random()
        const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[payloads[0].schema]])
        const result = await getHash(pointerHash)
        expectHashNotFound(result)
      })
    })
    describe('schema', () => {
      const account = Account.random()
      const schemaA = getTestSchemaName()
      const schemaB = getTestSchemaName()
      const payloadBaseA = getNewPayload()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.parse(payloadBaseA)
      const payloadBaseB = getNewPayload()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.parse(payloadBaseB)
      const schemas = [schemaA, schemaB]
      beforeAll(async () => {
        await insertPayload([payloadA.payload, payloadB.payload], account)
      })
      describe('single schema', () => {
        it.each([
          [schemaA, payloadA.payload],
          [schemaB, payloadB.payload],
        ])('returns payload of schema type', async (schema, expected) => {
          const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('multiple schema rules', () => {
        describe('combined serially', () => {
          it('returns payload of either schema', async () => {
            const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[payloadA.schema, payloadB.schema]])
            const result = await getHash(pointerHash)
            expect(schemas).toContain(result.schema)
          })
        })
        describe('combined in parallel', () => {
          it('returns payload of either schema', async () => {
            const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [[payloadA.schema], [payloadB.schema]])
            const result = await getHash(pointerHash)
            expect(schemas).toContain(result.schema)
          })
        })
      })
      it('no matching schema', async () => {
        const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [['network.xyo.test']])
        const result = await getHash(pointerHash)
        expectHashNotFound(result)
      })
    })
    describe.skip('timestamp direction', () => {
      const account = unitTestSigningAccount
      it('ascending', async () => {
        // TODO
      })
      it('descending', async () => {
        // TODO
      })
      it('no matching timestamp', async () => {
        const pointerHash = await createPayloadPointer([[account.addressValue.hex]], [], Date.now(), 'asc')
        const result = await getHash(pointerHash)
        expectHashNotFound(result)
      })
    })
  })
  describe('with no rules', () => {
    it('is valid', () => {
      // TODO:
    })
  })
})
