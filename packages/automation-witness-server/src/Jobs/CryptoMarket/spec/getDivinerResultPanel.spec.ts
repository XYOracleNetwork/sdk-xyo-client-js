import { PayloadBuilder } from '@xyo-network/payload-builder'

import { reportDivinerResult } from '../reportDivinerResult'

describe('getAggregatePricePanel', () => {
  it('gets an getAggregatePricePanel', async () => {
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    expect(await reportDivinerResult(payload)).toBeObject()
  })
})
