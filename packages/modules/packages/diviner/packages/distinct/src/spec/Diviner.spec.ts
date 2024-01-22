import { AnyObject } from '@xylabs/object'
import { Payload } from '@xyo-network/payload-model'

import { DistinctDiviner } from '../Diviner'
describe('RangeDiviner', () => {
  it('Generate', async () => {
    const diviner = await DistinctDiviner.create({ account: 'random' })
    const inPayloads: Payload<AnyObject>[] = [
      {
        schema: 'network.xyo.test',
        value: 1,
      },
      {
        schema: 'network.xyo.test',
        value: 2,
      },
      {
        schema: 'network.xyo.test',
        value: 3,
      },
      {
        schema: 'network.xyo.test',
        value: 3,
      },
    ]
    const outPayloads = await diviner.divine(inPayloads)
    expect(outPayloads).toBeArrayOfSize(3)
  })
})
