import { XyoAccount } from '@xyo-network/account'

import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainWitness, XyoDomainWitnessConfigSchema } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', () => {
    const witness = new XyoDomainWitness({ account: new XyoAccount(), schema: XyoDomainWitnessConfigSchema, targetSchema: XyoDomainPayloadSchema })
    expect(witness).toBeTruthy()
    expect(XyoDomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDemarc', () => {
    expect(XyoDomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
