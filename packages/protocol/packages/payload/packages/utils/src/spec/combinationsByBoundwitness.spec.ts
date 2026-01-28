import '@xylabs/vitest-extended'

import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { Schema } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { combinationsByBoundwitness } from '../combinationsByBoundwitness.ts'

describe('combinationsByBoundwitness', () => {
  const payloadCount = 2
  const testMatrix = [
    ['with single payload', ['network.xyo.temp.a']],
    ['with multiple payload', ['network.xyo.temp.a', 'network.xyo.temp.b']],
    ['with with many payloads', ['network.xyo.temp.a', 'network.xyo.temp.b', 'network.xyo.temp.c']],
  ] as [string, Schema[]][]
  describe.each(testMatrix)('%s', (_title, schemas) => {
    const payloads = schemas.map((schema) => {
      return [...Array(payloadCount).keys()].map((i) => {
        return { i, schema }
      })
    })
    const bws: BoundWitness[] = []
    beforeAll(async () => {
      for (const p of payloads) {
        const bw = await (new BoundWitnessBuilder().payloads(p)).build()
        bws.push(bw[0])
      }
    })
    it('finds the distinct combinations of all payloads', async () => {
      // All all inputs
      const inputs = [...bws, ...payloads.flat()]
      const result = await combinationsByBoundwitness(inputs)
      expect(result).toBeArrayOfSize(bws.length)
    })
    it('filters duplicates', async () => {
      // Add extra (duplicate) inputs
      const inputs = [...bws, ...payloads.flat(), ...bws, ...payloads.flat()]
      const result = await combinationsByBoundwitness(inputs)
      expect(result).toBeArrayOfSize(bws.length)
    })
    it('omits sparse inputs', async () => {
      // Remove some inputs
      const input = payloads.flat()
      input.pop() // Remove one payload
      const inputs = [...bws, ...input]
      const result = await combinationsByBoundwitness(inputs)
      // Expect all except the one missing the payload
      expect(result).toBeArrayOfSize(bws.length - 1)
    })
  })
})
