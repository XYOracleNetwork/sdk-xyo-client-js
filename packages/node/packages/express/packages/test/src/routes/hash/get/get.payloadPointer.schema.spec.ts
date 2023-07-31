import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { getHash, getNewPayload, getTestSchemaName, insertPayload } from '../../../testUtil'
import { createPointer, expectHashNotFoundError } from './get.payloadPointer.spec'

describe('/:hash', () => {
  describe('with rules for [schema]', () => {
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
      const [bw] = await new BoundWitnessBuilder().payloads([payloadA.payload(), payloadB.payload()]).witness(account).build()
      const payloads: Payload[] = [bw, payloadA.payload(), payloadB.payload()]
      const payloadResponse = await insertPayload(payloads, account)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    describe('single schema', () => {
      it.each([
        [schemaA, payloadA.payload()],
        [schemaB, payloadB.payload()],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointerHash = await createPointer([[]], [[schema]])
        const result = await getHash(pointerHash)
        expect(result).toEqual(expected)
      })
    })
    describe('single schema [w/address]', () => {
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
          const pointerHash = await createPointer([[]], [[payloadA.schema(), payloadB.schema()]])
          const result = await getHash(pointerHash)
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined serially [w/address]', () => {
        it('returns Payload of either schema', async () => {
          const pointerHash = await createPointer([[account.address]], [[payloadA.schema(), payloadB.schema()]])
          const result = await getHash(pointerHash)
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined in parallel', () => {
        it('returns Payload of either schema', async () => {
          const pointerHash = await createPointer([[]], [[payloadA.schema()], [payloadB.schema()]])
          const result = await getHash(pointerHash)
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined in parallel [w/address]', () => {
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
})
