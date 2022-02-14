import { XyoSystemInfoWitnessNode } from './SystemInfoNode'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoWitnessNode()
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info')
  })
})
