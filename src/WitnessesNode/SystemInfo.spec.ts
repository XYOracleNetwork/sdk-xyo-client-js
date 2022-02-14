import { XyoSystemInfoWitness } from './SystemInfo'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoWitness()
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info')
  })
})
