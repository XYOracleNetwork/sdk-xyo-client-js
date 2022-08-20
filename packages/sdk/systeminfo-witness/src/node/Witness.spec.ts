import { XyoAccount } from '@xyo-network/account'

import { XyoSystemInfoPayloadSchema } from '../shared'
import { XyoSystemInfoNodeWitness, XyoSystemInfoNodeWitnessConfigSchema } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoNodeWitness({
      account: new XyoAccount(),
      schema: XyoSystemInfoNodeWitnessConfigSchema,
      targetSchema: XyoSystemInfoPayloadSchema,
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info')
  }, 60000)
})
