import '@xylabs/vitest-extended'

import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { asSchema, type Schema } from '@xyo-network/payload-model'
import {
  describe, expect, it,
} from 'vitest'

import { intraBoundwitnessSchemaCombinations } from '../intraBoundwitnessSchemaCombinations.ts'

describe('intraBoundwitnessSchemaCombinations', () => {
  const payloadCount = 2
  const testMatrix = [
    ['with single schema', [asSchema('network.xyo.temp.a', true)]],
    ['with two schemas', [asSchema('network.xyo.temp.a', true), asSchema('network.xyo.temp.b', true)]],
    ['with with many schemas', [asSchema('network.xyo.temp.a', true), asSchema('network.xyo.temp.b', true), asSchema('network.xyo.temp.c', true)]],
  ] as [string, Schema[]][]
  describe.each(testMatrix)('%s', (_title, schemas) => {
    const payloads = schemas.map((schema) => {
      return [...Array(payloadCount).keys()].map((i) => {
        return { i, schema }
      })
    })
    it('finds the distinct combinations of all payloads', async () => {
      const [bw] = await new BoundWitnessBuilder().payloads(payloads.flat()).build()
      const result = intraBoundwitnessSchemaCombinations(bw, schemas)
      expect(result).toBeArrayOfSize(Math.pow(payloadCount, schemas.length))
    })
  })
  describe.skip('with one dimension very large', () => {
    const payloadCount = 5_000_000
    const schemaA = asSchema('network.xyo.temp.a', true)
    const payloadsA = [...Array(payloadCount).keys()].map((i) => {
      return { i, schema: schemaA }
    })
    const schemaB = asSchema('network.xyo.temp.b', true)
    const payloadsB = [{ i: 0, schema: schemaB }]
    const payloads = [...payloadsA, ...payloadsB]
    const schemas = [schemaA, schemaB]
    it('finds the distinct combinations of all payloads', async () => {
      const [bw] = await new BoundWitnessBuilder().payloads(payloads.flat()).build()
      const result = intraBoundwitnessSchemaCombinations(bw, schemas)
      expect(result).toBeArrayOfSize(Math.pow(payloadsA.length, payloadsB.length))
    })
  })
})
