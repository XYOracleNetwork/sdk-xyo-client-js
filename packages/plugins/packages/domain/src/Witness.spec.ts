import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'
import { XyoDomainSchema } from './Schema'
import { XyoDomainWitness } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', async () => {
    const witness = await XyoDomainWitness.create({
      config: {
        domain: 'xyo.network',
        schema: XyoDomainWitnessConfigSchema,
        targetSchema: XyoDomainSchema,
      } as XyoDomainWitnessConfig,
    })
    expect(witness).toBeTruthy()
    expect(XyoDomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDemarc', () => {
    expect(XyoDomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
