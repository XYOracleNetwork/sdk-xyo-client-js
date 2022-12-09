import { XyoDomainWitnessConfigSchema } from './Config'
import { XyoDomainWitness } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', async () => {
    const witness = await XyoDomainWitness.create({
      config: {
        domain: 'xyo.network',
        schema: XyoDomainWitnessConfigSchema,
      },
    })
    expect(witness).toBeTruthy()
    expect(XyoDomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDmarc', () => {
    expect(XyoDomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
