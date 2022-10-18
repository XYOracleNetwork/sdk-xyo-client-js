import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = await XyoNodeSystemInfoWitness.create({
      config: { schema: XyoNodeSystemInfoWitnessConfigSchema, targetSchema: XyoNodeSystemInfoSchema } as XyoWitnessConfig,
    })

    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
  }, 60000)
})
