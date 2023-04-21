import { Payload } from '@xyo-network/payload-model'

import { arimaForecasting } from '../arimaForecasting'

const transformer = (payload: Payload) => {
  return (payload as Payload<{ data: number }>)?.data || NaN
}

describe('arimaForecasting', () => {
  it('should forecast', () => {
    const dataPoints: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const payloads = dataPoints.map((data) => {
      return { data, schema: 'network.xyo.test' }
    })
    const result = arimaForecasting(payloads, transformer)
    expect(result).toBeTruthy()
  })
})
