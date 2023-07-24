import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { SortDirection } from '@xyo-network/diviner-payload-model'
import {
  PayloadAddressRule,
  PayloadPointerPayload,
  PayloadPointerSchema,
  PayloadRule,
  PayloadSchemaRule,
  PayloadTimestampDirectionRule,
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { getHash, getNewBoundWitness, getNewPayload, getTestSchemaName, insertBlock, insertPayload } from '../../../testUtil'

const createPointer = async (
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
  expect(pointerResponse).toBeArrayOfSize(2)
  return await PayloadWrapper.hashAsync(pointer)
}

const expectError = (result: Payload, detail: string, status: string, title?: string) => {
  expect(result).toBeObject()
  const error = result as unknown as { errors: { detail: string; status: string; title?: string }[] }
  expect(error.errors).toBeArrayOfSize(1)
  const expected = title ? { detail, status, title } : { detail, status }
  expect(error.errors[0]).toEqual(expected)
}

const expectHashNotFoundError = (result: Payload) => {
  expectError(result, 'Hash not found', `${StatusCodes.NOT_FOUND}`)
}

const expectSchemaNotSuppliedError = (result: Payload) => {
  expectError(result, 'At least one schema must be supplied', `${StatusCodes.INTERNAL_SERVER_ERROR}`, 'Error')
}

describe('/:hash', () => {
  describe('return format is', () => {
    const account = Account.randomSync()
    let bw: BoundWitness
    let payloads: Payload[]
    beforeAll(async () => {
      // Create data pointer will reference
      ;[bw, payloads] = await getNewBoundWitness([account])
      const blockResponse = await insertBlock(bw, account)
      expect(blockResponse.length).toBe(2)
      const payloadResponse = await insertPayload(payloads, account)
      expect(payloadResponse.length).toBe(2)
    })
    it('a single Payload matching the pointer criteria', async () => {
      const expected = payloads[0]
      const pointerHash = await createPointer([[account.address]], [[expected.schema]])
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      //expect(PayloadWrapper.parse(response).valid).toBeTrue()
      expect(response).toEqual(expected)
    })
    it(`${ReasonPhrases.NOT_FOUND} if no Payloads match the criteria`, async () => {
      const result = await getHash('non_existent_hash')
      expectHashNotFoundError(result)
    })
  })
  describe('with rules for', () => {
    describe('address', () => {
      const accountA = Account.randomSync()
      const accountB = Account.randomSync()
      const accountC = Account.randomSync()
      const accountD = Account.randomSync()
      const payloads: Payload[] = []
      beforeAll(async () => {
        const [bwA, payloadsA] = await getNewBoundWitness([accountA])
        const [bwB, payloadsB] = await getNewBoundWitness([accountB])
        const [bwC, payloadsC] = await getNewBoundWitness([accountC])
        const [bwD, payloadsD] = await getNewBoundWitness([accountD])
        const [bwE, payloadsE] = await getNewBoundWitness([accountC, accountD])
        const [bwF, payloadsF] = await getNewBoundWitness([accountC])
        const [bwG, payloadsG] = await getNewBoundWitness([accountD])
        payloads.push(...[...payloadsA, ...payloadsB, ...payloadsC, ...payloadsD, ...payloadsE, ...payloadsF, ...payloadsG])
        const boundWitnesses = [bwA, bwB, bwC, bwD, bwE, bwF, bwG]
        const blockResponse = await insertBlock(boundWitnesses)
        expect(blockResponse.length).toBe(2)
        const payloadResponse = await insertPayload(payloads)
        expect(payloadResponse.length).toBe(2)
      })
      describe('single address', () => {
        it.each([
          [accountA, () => payloads[0]],
          [accountB, () => payloads[1]],
        ])('returns Payload signed by address', async (account, getData) => {
          const expected = getData()
          const pointerHash = await createPointer([[account.address]], [[expected.schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('multiple address rules', () => {
        describe('combined serially', () => {
          it('returns Payload signed by both addresses', async () => {
            const expected = payloads[5]
            const pointerHash = await createPointer([[accountC.address], [accountD.address]], [[expected.schema]])
            const result = await getHash(pointerHash)
            expect(result).toEqual(expected)
          })
        })
        describe('combined in parallel', () => {
          it('returns Payload signed by both address', async () => {
            const expected = payloads[5]
            const pointerHash = await createPointer([[accountC.address, accountD.address]], [[expected.schema]])
            const result = await getHash(pointerHash)
            expect(result).toEqual(expected)
          })
        })
      })
      it('no matching address', async () => {
        const pointerHash = await createPointer([[Account.randomSync().address]], [[payloads[0].schema]])
        const result = await getHash(pointerHash)
        expectHashNotFoundError(result)
      })
    })
    describe('schema', () => {
      const account = Account.randomSync()
      const schemaA = getTestSchemaName()
      const schemaB = getTestSchemaName()
      const payloadBaseA = getNewPayload()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.parse(payloadBaseA) as PayloadWrapper
      const payloadBaseB = getNewPayload()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.parse(payloadBaseB) as PayloadWrapper
      const schemas = [schemaA, schemaB]
      beforeAll(async () => {
        const payloadResponse = await insertPayload([payloadA.payload(), payloadB.payload()], account)
        expect(payloadResponse.length).toBe(2)
      })
      describe('single schema', () => {
        it.each([
          [schemaA, payloadA.payload()],
          [schemaB, payloadB.payload()],
        ])('returns Payload of schema type', async (schema, expected) => {
          const pointerHash = await createPointer([[account.address]], [[schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('multiple schema rules', () => {
        describe('combined serially', () => {
          it('returns Payload of either schema', async () => {
            const pointerHash = await createPointer([[account.address]], [[payloadA.schema(), payloadB.schema()]])
            const result = await getHash(pointerHash)
            expect(schemas).toContain(result.schema)
          })
        })
        describe('combined in parallel', () => {
          it('returns Payload of either schema', async () => {
            const pointerHash = await createPointer([[account.address]], [[payloadA.schema()], [payloadB.schema()]])
            const result = await getHash(pointerHash)
            expect(schemas).toContain(result.schema)
          })
        })
      })
      it('no matching schema', async () => {
        const pointerHash = await createPointer([[account.address]], [['network.xyo.test']])
        const result = await getHash(pointerHash)
        expectHashNotFoundError(result)
      })
    })
    describe('timestamp direction', () => {
      const account = Account.randomSync()
      let payloads: Payload[]
      let expectedSchema: string
      beforeAll(async () => {
        const [bwA, payloadsA] = await getNewBoundWitness([account])
        const [bwB, payloadsB] = await getNewBoundWitness([account])
        const [bwC, payloadsC] = await getNewBoundWitness([account])
        payloads = [...payloadsA, ...payloadsB, ...payloadsC]
        const boundWitnesses = [bwA, bwB, bwC]
        expectedSchema = payloadsA[0].schema
        for (const bw of boundWitnesses) {
          const blockResponse = await insertBlock(bw, account)
          expect(blockResponse.length).toBe(2)
        }
        const payloadResponse = await insertPayload(payloads)
        expect(payloadResponse.length).toBe(2)
      })
      it('ascending', async () => {
        const expected = assertEx(payloads.at(0))
        const pointerHash = await createPointer([[account.address]], [[expectedSchema]], 0, 'asc')
        const result = await getHash(pointerHash)
        expect(result).toEqual(expected)
      })
      it('descending', async () => {
        const expected = assertEx(payloads.at(-1))
        const pointerHash = await createPointer([[account.address]], [[expectedSchema]], Date.now(), 'desc')
        const result = await getHash(pointerHash)
        expect(result).toEqual(expected)
      })
      it('no matching timestamp', async () => {
        const pointerHash = await createPointer([[account.address]], [[expectedSchema]], Date.now(), 'asc')
        const result = await getHash(pointerHash)
        expectHashNotFoundError(result)
      })
    })
  })
  describe('with no rules', () => {
    it('returns error ', async () => {
      const pointerHash = await createPointer([], [])
      const result = await getHash(pointerHash)
      expectSchemaNotSuppliedError(result)
    })
  })
})
