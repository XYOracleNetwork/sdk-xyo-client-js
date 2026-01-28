import '@xylabs/vitest-extended'

import { asSchema, type Payload } from '@xyo-network/payload-model'
import {
  describe, expect, it,
} from 'vitest'

import { arimaForecastingMethod } from '../arima.ts'

const transformer = (payload: Payload) => (payload as Payload<{ data: number }>)?.data || Number.NaN

describe('arimaForecasting', () => {
  it('should forecast', async () => {
    const actual: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const expected: number[] = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const payloads = actual.map((data) => {
      return { data, schema: asSchema('network.xyo.test', true) }
    })
    const result = await arimaForecastingMethod(payloads, transformer)
    expect(result).toBeTruthy()
    for (const [index, payload] of result.entries()) {
      expect((payload as { schema: string; value: number }).value).toBeCloseTo(expected[index])
    }
  })
})
