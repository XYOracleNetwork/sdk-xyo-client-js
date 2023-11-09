import { Account } from '@xyo-network/account'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { NodeSystemInfoWitnessConfigSchema } from '../Config'
import { NodeSystemInfoWitness } from '../Witness'

describe('SystemInfoWitness', () => {
  test('observe', async () => {
    const witness = await NodeSystemInfoWitness.create({
      account: Account.randomSync(),
      config: { schema: NodeSystemInfoWitnessConfigSchema },
    })

    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  }, 60000)
  test('observe [no config]', async () => {
    const witness = await NodeSystemInfoWitness.create()

    const [observation] = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.node')
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  }, 60000)
})
