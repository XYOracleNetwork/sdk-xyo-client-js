import { XyoPayloadBuilder } from '@xyo-network/payload-builder'

import { getDivinerResultPanel } from './getDivinerResultPanel'

describe('getAggregatePricePanel', () => {
  it('gets an getAggregatePricePanel', async () => {
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
    expect(await getDivinerResultPanel(payload)).toBeObject()
  })
})
