import { XyoAccount } from '@xyo-network/account'

import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainWitness } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', () => {
    const witness = new XyoDomainWitness({ account: new XyoAccount(), schema: 'network.xyo.domain.config', targetSchema: XyoDomainPayloadSchema })
    expect(witness).toBeTruthy()
    expect(XyoDomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDemarc', () => {
    expect(XyoDomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
