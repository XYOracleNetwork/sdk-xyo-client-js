import { XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoNodeSystemInfoWitness({ config: { schema: XyoNodeSystemInfoWitnessConfigSchema, targetSchema: XyoNodeSystemInfoSchema } })
    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
  }, 60000)
})
