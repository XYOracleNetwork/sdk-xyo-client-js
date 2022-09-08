import { XyoDomainWitness } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', () => {
    const witness = new XyoDomainWitness({
      domain: 'xyo.network',
    })
    expect(witness).toBeTruthy()
    expect(XyoDomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDemarc', () => {
    expect(XyoDomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
