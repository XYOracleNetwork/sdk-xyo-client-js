import { Payload } from '@xyo-network/payload-model'

import { arimaForecasting } from '../arima'

const transformer = (payload: Payload) => (payload as Payload<{ data: number }>)?.data || NaN

describe('arimaForecasting', () => {
  it('should forecast', async () => {
    const actual: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const expected: number[] = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const payloads = actual.map((data) => {
      return { data, schema: 'network.xyo.test' }
    })
    const result = await arimaForecasting(payloads, transformer)
    expect(result).toBeTruthy()
    result.map((payload, index) => {
      expect((payload as { schema: string; value: number }).value).toBeCloseTo(expected[index])
    })
  })
})
