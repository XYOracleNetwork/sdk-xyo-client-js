/* eslint-disable sonarjs/no-duplicate-string */
import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, unMeta } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { createPointer, getNewPayload, getTestSchemaName, insertPayload } from './testUtil/index.js'

describe('/:hash', () => {
  describe('with rules for [schema]', () => {
    const account = Account.random()
    const schemaA = getTestSchemaName()
    const schemaB = getTestSchemaName()
    const payloadBaseA = (async () => PayloadBuilder.build({ ...(await getNewPayload()), schema: schemaA }))()
    const payloadA: Promise<PayloadWrapper> = (async () => PayloadWrapper.wrap(await payloadBaseA))()
    const payloadBaseB = (async () => PayloadBuilder.build({ ...(await getNewPayload()), schema: schemaB }))()
    const payloadB: Promise<PayloadWrapper> = (async () => PayloadWrapper.wrap(await payloadBaseB))()
    const schemas = [schemaA, schemaB]
    beforeAll(async () => {
      const [bw] = await new BoundWitnessBuilder()
        .payloads([(await payloadA).payload, (await payloadB).payload])
        .witness(await account)
        .build()
      const payloads: Payload[] = [bw, (await payloadA).payload, (await payloadB).payload]
      const payloadResponse = await insertPayload(payloads, await account)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    describe('single schema', () => {
      it.each([
        [schemaA, payloadA],
        [schemaB, payloadB],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointerHash = await createPointer([[]], [[schema]])
        const result = await getHash(pointerHash)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(unMeta(result as any)).toEqual(unMeta((await expected).payload as any))
      })
    })
    describe('single schema [w/address]', () => {
      it.each([
        [schemaA, payloadA],
        [schemaB, payloadB],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointerHash = await createPointer([[(await account).address]], [[schema]])
        const result = await getHash(pointerHash)
        const expectedPayload = (await expected).payload
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log(`expectedPayload: ${(expectedPayload as any).$hash}`)
        console.log(JSON.stringify(expectedPayload, null, 2))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log(`result: ${(result as any).$hash}`)
        const h1 = await PayloadBuilder.dataHash(expectedPayload)
        console.log(`h1: ${h1}`)
        const h2 = await PayloadBuilder.dataHash(result)
        console.log(`h2 ${h2}`)
        expect(result).toEqual(expectedPayload)
      })
    })
    describe('multiple schema rules', () => {
      describe('combined serially', () => {
        it('returns Payload of either schema', async () => {
          const pointerHash = await createPointer([[]], [[(await payloadA).schema(), (await payloadB).schema()]])
          const result = await getHash(pointerHash)
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined serially [w/address]', () => {
        it('returns Payload of either schema', async () => {
          const pointerHash = await createPointer([[(await account).address]], [[(await payloadA).schema(), (await payloadB).schema()]])
          const result = await getHash(pointerHash)
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined in parallel', () => {
        it('returns Payload of either schema', async () => {
          const pointerHash = await createPointer([[]], [[(await payloadA).schema()], [(await payloadB).schema()]])
          const result = await getHash(pointerHash)
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined in parallel [w/address]', () => {
        it('returns Payload of either schema', async () => {
          const pointerHash = await createPointer([[(await account).address]], [[(await payloadA).schema()], [(await payloadB).schema()]])
          const result = await getHash(pointerHash)
          expect(schemas).toContain(result.schema)
        })
      })
    })
    it('no matching schema', async () => {
      const pointerHash = await createPointer([[(await account).address]], [['network.xyo.test']])
      const result = await getHash(pointerHash)
      // expectHashNotFoundError(result)
    })
  })
})
