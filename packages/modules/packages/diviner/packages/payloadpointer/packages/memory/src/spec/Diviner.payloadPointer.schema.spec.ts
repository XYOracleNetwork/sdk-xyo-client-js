import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { Account } from '@xyo-network/account'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { NodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import {
  beforeAll, describe, expect, it,
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

    const payloadA = {
      ...getNewPayload(), schema: schemaA, salt: 1,
    }
    const payloadB = {
      ...getNewPayload(), schema: schemaB, salt: 2,
    }
    const schemas = [schemaA, schemaB]
    let node: NodeInstance
    let archivist: ArchivistInstance
    let sut: PayloadPointerDiviner
    beforeAll(async () => {
      node = await getTestNode()
      archivist = await getArchivist(node)
      sut = await getPayloadPointerDiviner(node)
      const [bw] = await new BoundWitnessBuilder()
        .payloads([payloadA, payloadB])
        .signer(await account)
        .build()
      const payloads: Payload[] = [bw, payloadA, payloadB]
      for (const payload of payloads) {
        await delay(2)
        const payloadResponse = await insertPayload(archivist, payload)
        expect(payloadResponse.length).toBe(1)
      }
    })
    describe('single schema', () => {
      it.each([
        [schemaA, payloadA],
        [schemaB, payloadB],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointer = createPointer([[]], [[schema]])
        const result = await sut.divine([pointer])
        expect(result).toBeArrayOfSize(1)
        const [actual] = result
        expect(PayloadBuilder.omitMeta(actual)).toEqual(expected)
      })
    })
    describe('single schema [w/address]', () => {
      it.each([
        [schemaA, payloadA],
        [schemaB, payloadB],
      ])('returns Payload of schema type', async (schema, expected) => {
        const pointer = createPointer([[(await account).address]], [[schema]])
        const result = await sut.divine([pointer])
        expect(result).toBeArrayOfSize(1)
        const [actual] = result
        expect(PayloadBuilder.omitMeta(actual)).toEqual(expected)
      })
    })
    describe('multiple schema rules', () => {
      describe('combined serially', () => {
        it('returns Payload of either schema', async () => {
          const pointer = createPointer([[]], [[payloadA.schema, payloadB.schema]])
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
          const pointer = createPointer([[(await account).address]], [[payloadA.schema, payloadB.schema]])
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
          const pointer = createPointer([[]], [[payloadA.schema], [payloadB.schema]])
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
          const pointer = createPointer([[(await account).address]], [[payloadA.schema], [payloadB.schema]])
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
      const pointer = createPointer([[(await account).address]], [['network.xyo.test']])
      const results = await sut.divine([pointer])
      expect(results).toBeDefined()
      expect(results).toBeEmpty()
    })
  })
})
