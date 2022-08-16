import { XyoAccount } from '@xyo-network/account'

import { XyoSystemInfoNodeWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoNodeWitness({
      account: new XyoAccount(),
      schema: 'network.xyo.systen.info.config',
      targetSchema: 'network.xyo.system.info.node',
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
  }, 60000)
})
