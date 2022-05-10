import { XyoWitness } from './Witness'

describe('XyoWitness', () => {
  test('valid-instantiation', () => {
    const template = {
      schema: 'network.xyo.foo',
    }
    const witness = new XyoWitness({ schema: 'network.xyo.payload', template })
    expect(witness).toBeTruthy()
    expect(witness.schema).toBe('network.xyo.payload')
    expect(witness.template).toBe(template)
  })
})
