import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { SortDirection } from '@xyo-network/diviner-payload-model'
import {
  BoundWitnessPointerPayload,
  BoundWitnessPointerSchema,
  PayloadAddressRule,
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

  const pointer = new PayloadBuilder<BoundWitnessPointerPayload>({ schema: BoundWitnessPointerSchema }).fields({ reference }).build()
  const pointerResponse = await insertPayload(pointer)
  expect(pointerResponse).toBeArrayOfSize(1)
  //expect(pointerResponse.map((bw) => bw.payload_schemas.includes(BoundWitnessPointerSchema)).some((x) => x)).toBeTrue()
  return await PayloadWrapper.hashAsync(pointer)
}

const expectError = (result: Payload, detail: string, status: string, title?: string) => {
  expect(result).toBeObject()
  const error = result as unknown as { errors: { detail: string; status: string; title?: string }[] }
  expect(error.errors?.length).toBeGreaterThan(0)
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
    it('a single BoundWitness matching the pointer criteria', async () => {
      const [bw, payloads] = await getNewBoundWitness([account])
      const blockResponse = await insertBlock(bw, account)
      expect(blockResponse.length).toBe(1)
      const expected = BoundWitnessWrapper.parse(bw).body()
      const pointerHash = await createPointer([[account.address]], [[payloads[0].schema]])
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      expect(await PayloadWrapper.wrap(response).getValid()).toBeTrue()
      expect(response).toEqual(expected)
    })
    it(`${ReasonPhrases.NOT_FOUND} if no BoundWitnesses match the criteria`, async () => {
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
      const bws: BoundWitness[] = []
      beforeAll(async () => {
        const [bwA, payloadsA] = await getNewBoundWitness([accountA])
        const [bwB, payloadsB] = await getNewBoundWitness([accountB])
        const [bwC, payloadsC] = await getNewBoundWitness([accountC])
        const [bwD, payloadsD] = await getNewBoundWitness([accountD])
        const [bwE, payloadsE] = await getNewBoundWitness([accountC, accountD])
        const [bwF, payloadsF] = await getNewBoundWitness([accountC])
        const [bwG, payloadsG] = await getNewBoundWitness([accountD])
        payloads.push(...[...payloadsA, ...payloadsB, ...payloadsC, ...payloadsD, ...payloadsE, ...payloadsF, ...payloadsG])
        bws.push(...[bwA, bwB, bwC, bwD, bwE, bwF, bwG])
        const blockResponse = await insertBlock(bws)
        expect(blockResponse.length).toBe(payloads.length)
      })
      describe('single address', () => {
        it.each([
          [accountA, () => BoundWitnessWrapper.parse(bws[0]).body()],
          [accountB, () => BoundWitnessWrapper.parse(bws[1]).body()],
        ])('returns BoundWitness signed by address', async (account, data) => {
          const expected = data()
          const pointerHash = await createPointer([[account.address]], [[payloads[0].schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('multiple address rules', () => {
        describe('combined serially', () => {
          it('returns BoundWitness signed by both addresses', async () => {
            const expected = BoundWitnessWrapper.parse(bws[4]).body()
            const pointerHash = await createPointer([[accountC.address], [accountD.address]], [[payloads[0].schema]])
            const result = await getHash(pointerHash)
            expect(result).toEqual(expected)
          })
        })
        describe('combined in parallel', () => {
          it('returns BoundWitness signed by both address', async () => {
            const expected = BoundWitnessWrapper.parse(bws[4]).body()
            const pointerHash = await createPointer([[accountC.address, accountD.address]], [[payloads[0].schema]])
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
      const payloadBaseA = getNewPayload()
      const schemaA = getTestSchemaName()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.wrap(payloadBaseA)
      const payloadBaseB = getNewPayload()
      const schemaB = getTestSchemaName()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.wrap(payloadBaseB)
      const schemas = [schemaA, schemaB]
      const boundWitnesses: BoundWitness[] = []
      beforeAll(async () => {
        const [bwA] = await getNewBoundWitness([account], [payloadA.payload()])
        const [bwB] = await getNewBoundWitness([account], [payloadB.payload()])
        boundWitnesses.push(...[bwA, bwB])
        const payloadResponse = await insertBlock(boundWitnesses, account)
        expect(payloadResponse.length).toBe(boundWitnesses.length)
      })
      describe('single schema', () => {
        it.each([
          [schemaA, () => BoundWitnessWrapper.parse(boundWitnesses[0]).body()],
          [schemaB, () => BoundWitnessWrapper.parse(boundWitnesses[1]).body()],
        ])('returns BoundWitness of schema type', async (schema, data) => {
          const expected = data()
          const pointerHash = await createPointer([[account.address]], [[schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('multiple schema rules', () => {
        describe('combined serially', () => {
          it('returns BoundWitness of Payload for either schema', async () => {
            const pointerHash = await createPointer([[account.address]], [[payloadA.schema(), payloadB.schema()]])
            const result = await getHash<BoundWitness>(pointerHash)
            expect(schemas).toIncludeAllMembers(result.payload_schemas)
          })
        })
        describe('combined in parallel', () => {
          it('returns BoundWitness of Payload for either schema', async () => {
            const pointerHash = await createPointer([[account.address]], [[payloadA.schema()], [payloadB.schema()]])
            const result = await getHash<BoundWitness>(pointerHash)
            expect(schemas).toIncludeAllMembers(result.payload_schemas)
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
      let bwA: BoundWitness
      let bwB: BoundWitness
      let bwC: BoundWitness
      let boundWitnesses: BoundWitness[]
      let expectedSchema: string
      beforeAll(async () => {
        let payloadsA: Payload[]
        ;[bwA, payloadsA] = await getNewBoundWitness([account])
        ;[bwB] = await getNewBoundWitness([account])
        ;[bwC] = await getNewBoundWitness([account])
        boundWitnesses = [bwA, bwB, bwC]
        expectedSchema = payloadsA[0].schema
        for (const bw of boundWitnesses) {
          const blockResponse = await insertBlock(bw, account)
          expect(blockResponse.length).toBe(1)
        }
      })
      it('ascending', async () => {
        const expected = BoundWitnessWrapper.parse(assertEx(boundWitnesses.at(0))).body()
        const pointerHash = await createPointer([[account.address]], [[expectedSchema]], 0, 'asc')
        const result = await getHash(pointerHash)
        expect(result).toEqual(expected)
      })
      it('descending', async () => {
        const expected = BoundWitnessWrapper.parse(assertEx(boundWitnesses.at(-1))).body()
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
