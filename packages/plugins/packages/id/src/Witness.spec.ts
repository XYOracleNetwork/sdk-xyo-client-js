import { XyoIdWitness } from './Witness'

describe('XyoIdWitness', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      salt: 'test',
    })
    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.id')
  })
})
