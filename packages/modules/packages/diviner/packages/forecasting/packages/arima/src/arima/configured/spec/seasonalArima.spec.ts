import '@xylabs/vitest-extended'

import { asSchema, type Payload } from '@xyo-network/payload-model'

import { seasonalArimaForecastingMethod } from '../seasonalArima.ts'

const twoPi = 2 * Math.PI

import {
  describe, expect, it,
} from 'vitest'

const transformer = (payload: Payload) => (payload as Payload<{ data: number }>)?.data || Number.NaN

describe('seasonalArimaForecasting', () => {
  it('should forecast', async () => {
    const length = 10
    const actual: number[] = Array.from({ length }, (_, i) => (i / (length - 1)) * twoPi).map(x => Math.sin(x) + 1)
    const payloads = actual.map((data) => {
      return { data, schema: asSchema('network.xyo.test', true) }
    })
    const result = await seasonalArimaForecastingMethod(payloads, transformer)
    expect(result).toBeArray()
  })
})
