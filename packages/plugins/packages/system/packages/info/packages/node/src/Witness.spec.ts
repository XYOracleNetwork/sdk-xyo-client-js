import { XyoAccount } from '@xyo-network/account'

import { XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoNodeSystemInfoWitness({
      account: new XyoAccount(),
      schema: XyoNodeSystemInfoWitnessConfigSchema,
      targetSchema: XyoNodeSystemInfoPayloadSchema,
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
  }, 60000)
})
