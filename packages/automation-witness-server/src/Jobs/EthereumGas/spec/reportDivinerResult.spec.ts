import { PayloadBuilder } from '@xyo-network/payload-builder'

import { reportDivinerResult } from '../reportDivinerResult'

describe('reportDivinerResult', () => {
  it('reports diviner result', async () => {
    const payload = await new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const result = await reportDivinerResult(payload)
    expect(result).toBeArray()
  })
})
