import { Templates } from '../lib'
import { XyoWitness } from './Witness'

describe('XyoWitness', () => {
  test('valid-instantiation', () => {
    const witness = new XyoWitness({ schema: 'network.xyo.payload' })
    expect(witness).toBeTruthy()
  })

  test('generates-templates', () => {
    const template = XyoWitness.generateTemplate('network.xyo.domain')
    expect(template).toBe(Templates['network.xyo.domain'])
  })
})
