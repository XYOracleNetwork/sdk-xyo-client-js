import { XyoSimpleWitness } from './SimpleWitness'

describe('XyoWitness', () => {
  test('valid-instantiation', () => {
    const template = {
      schema: 'network.xyo.foo',
    }
    const witness = new XyoSimpleWitness({ schema: 'network.xyo.payload', template })
    expect(witness).toBeTruthy()
    expect(witness.config?.schema).toBe('network.xyo.payload')
    expect(witness.config?.template).toBe(template)
  })
})
