import { PayloadWrapper } from '@xyo-network/payload'

import { XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = await XyoNodeSystemInfoWitness.create({
      config: { schema: XyoNodeSystemInfoWitnessConfigSchema },
    })

    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
    expect(new PayloadWrapper(observation).valid).toBe(true)
  }, 60000)
  test('observe [no config]', async () => {
    const witness = await XyoNodeSystemInfoWitness.create()

    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
    expect(new PayloadWrapper(observation).valid).toBe(true)
  }, 60000)
})
