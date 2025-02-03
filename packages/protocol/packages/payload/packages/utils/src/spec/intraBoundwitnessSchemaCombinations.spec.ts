import '@xylabs/vitest-extended'

import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  describe, expect, it,
} from 'vitest'

import { intraBoundwitnessSchemaCombinations } from '../intraBoundwitnessSchemaCombinations.ts'

describe('intraBoundwitnessSchemaCombinations', () => {
  const payloadCount = 2
  const testMatrix: [string, string[]][] = [
    ['with single schema', ['network.xyo.temp.a']],
    ['with two schemas', ['network.xyo.temp.a', 'network.xyo.temp.b']],
    ['with with many schemas', ['network.xyo.temp.a', 'network.xyo.temp.b', 'network.xyo.temp.c']],
  ]
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
    const schemaA = 'network.xyo.temp.a'
    const payloadsA = [...Array(payloadCount).keys()].map((i) => {
      return { i, schema: schemaA }
    })
    const schemaB = 'network.xyo.temp.b'
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
