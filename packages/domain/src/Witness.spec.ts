import { XyoDomainConfigWitness } from './Witness'

describe('XyoDomainConfigWitness', () => {
  test('valid-instantiation', () => {
    const witness = new XyoDomainConfigWitness()
    expect(witness).toBeTruthy()
    expect(witness?.config?.schema).toBe('network.xyo.domain')
    expect(XyoDomainConfigWitness.demarc).toBe('_xyo')
  })

  test('generatesDemarc', () => {
    expect(XyoDomainConfigWitness.generateDemarc('foo')).toBe('_xyo.foo')
  })
})
