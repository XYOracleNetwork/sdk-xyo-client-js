import { XyoPayloadBuilder } from '@xyo-network/payload'

import { getDivinerResultPanel } from './getDivinerResultPanel'

describe('getDivinerResultPanel', () => {
  it('gets a panel', async () => {
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
    expect(await getDivinerResultPanel(payload)).toBeObject()
  })
})
