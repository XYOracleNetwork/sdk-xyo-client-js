import { XyoAccount } from '@xyo-network/account'

import { XyoDomainWitnessConfigSchema } from './Config'
import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainWitness } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', () => {
    const witness = new XyoDomainWitness({
      account: new XyoAccount(),
      domain: 'xyo.network',
      schema: XyoDomainWitnessConfigSchema,
      targetSchema: XyoDomainPayloadSchema,
    })
    expect(witness).toBeTruthy()
    expect(XyoDomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDemarc', () => {
    expect(XyoDomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
