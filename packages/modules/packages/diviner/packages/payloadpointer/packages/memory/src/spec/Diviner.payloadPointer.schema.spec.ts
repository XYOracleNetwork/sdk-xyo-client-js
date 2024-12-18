import '@xylabs/vitest-extended'

import { Account } from '@xyo-network/account'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { NodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import type { PayloadPointerDiviner } from '../Diviner.ts'
import {
  createPointer,
  getArchivist,
  getNewPayload,
  getPayloadPointerDiviner,
  getTestNode,
  getTestSchemaName,
  insertPayload,
} from './testUtil/index.ts'

describe('PayloadPointerDiviner', () => {
  describe('with rules for [schema]', () => {
    const account = Account.random()
    const schemaA = getTestSchemaName()
    const schemaB = getTestSchemaName()
    const payloadBaseA = (async () => PayloadBuilder.build({
      ...(await getNewPayload()), schema: schemaA, timestamp: Date.now(),
    }))()
    const payloadA: Promise<PayloadWrapper> = (async () => PayloadWrapper.wrap(await payloadBaseA))()
    const payloadBaseB = (async () => PayloadBuilder.build({
      ...(await getNewPayload()), schema: schemaB, timestamp: Date.now(),
    }))()
    const payloadB: Promise<PayloadWrapper> = (async () => PayloadWrapper.wrap(await payloadBaseB))()
    const schemas = [schemaA, schemaB]
    let node: NodeInstance
    let archivist: ArchivistInstance
    let sut: PayloadPointerDiviner
    beforeAll(async () => {
      node = await getTestNode()
      archivist = await getArchivist(node)
      sut = await getPayloadPointerDiviner(node)
      const [bw] = await new BoundWitnessBuilder()
        .payloads([(await payloadA).payload, (await payloadB).payload])
        .witness(await account)
        .build()
      const payloads: Payload[] = [bw, (await payloadA).payload, (await payloadB).payload]
      const payloadResponse = await insertPayload(archivist, payloads)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    describe('single schema', () => {
      it.each([
        [schemaA, payloadA],
        [schemaB, payloadB],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointer = await createPointer([[]], [[schema]])
        const result = await sut.divine([pointer])
        expect(result).toEqual([(await expected).payload])
      })
    })
    describe('single schema [w/address]', () => {
      it.each([
        [schemaA, payloadA],
        [schemaB, payloadB],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointer = await createPointer([[(await account).address]], [[schema]])
        const result = await sut.divine([pointer])
        expect(result).toEqual([(await expected).payload])
      })
    })
    describe('multiple schema rules', () => {
      describe('combined serially', () => {
        it('returns Payload of either schema', async () => {
          const pointer = await createPointer([[]], [[(await payloadA).schema(), (await payloadB).schema()]])
          const results = await sut.divine([pointer])
          expect(results).toBeDefined()
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined serially [w/address]', () => {
        it('returns Payload of either schema', async () => {
          const pointer = await createPointer([[(await account).address]], [[(await payloadA).schema(), (await payloadB).schema()]])
          const results = await sut.divine([pointer])
          expect(results).toBeDefined()
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined in parallel', () => {
        it('returns Payload of either schema', async () => {
          const pointer = await createPointer([[]], [[(await payloadA).schema()], [(await payloadB).schema()]])
          const results = await sut.divine([pointer])
          expect(results).toBeDefined()
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
      describe('combined in parallel [w/address]', () => {
        it('returns Payload of either schema', async () => {
          const pointer = await createPointer([[(await account).address]], [[(await payloadA).schema()], [(await payloadB).schema()]])
          const results = await sut.divine([pointer])
          expect(results).toBeDefined()
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(result).toBeDefined()
          expect(schemas).toContain(result.schema)
        })
      })
    })
    it('no matching schema', async () => {
      const pointer = await createPointer([[(await account).address]], [['network.xyo.test']])
      const results = await sut.divine([pointer])
      expect(results).toBeDefined()
      expect(results).toBeEmpty()
    })
  })
})
