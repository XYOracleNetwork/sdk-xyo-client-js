import { XyoPayloadBuilder } from '@xyo-network/payload-builder'

import { getDivinerResultPanel } from './getDivinerResultPanel'

describe('getDivinerResultPanel', () => {
  it('gets a panel', async () => {
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
    expect(await getDivinerResultPanel(payload)).toBeObject()
  })
})
