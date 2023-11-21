import { Payload } from '@xyo-network/payload-model'

import { seasonalArimaForecastingMethod } from '../seasonalArima'

const twoPi = 2 * Math.PI

const transformer = (payload: Payload) => (payload as Payload<{ data: number }>)?.data || NaN

describe('seasonalArimaForecasting', () => {
  it('should forecast', async () => {
    const length = 10
    const actual: number[] = Array.from({ length }, (_, i) => (i / (length - 1)) * twoPi).map((x) => Math.sin(x) + 1)
    const payloads = actual.map((data) => {
      return { data, schema: 'network.xyo.test' }
    })
    const result = await seasonalArimaForecastingMethod(payloads, transformer)
    expect(result).toBeArray()
  })
})
