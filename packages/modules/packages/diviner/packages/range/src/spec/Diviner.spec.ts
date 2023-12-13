import { RangeDivinerQuerySchema } from '@xyo-network/diviner-range-model'

import { RangeDiviner } from '../Diviner'
describe('RangeDiviner', () => {
  it('Generate', async () => {
    const diviner = await RangeDiviner.create({ account: 'random' })
    const numbers = await diviner.divine([{ count: 20, schema: RangeDivinerQuerySchema, start: 10 }])
    expect(numbers).toBeArrayOfSize(20)
    expect(numbers[0].value).toBe(10)
    expect(numbers[19].value).toBe(29)
  })
})
