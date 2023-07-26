import { testIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { PentairScreenlogicWitness } from '../Witness'

describe('PentairScreenLogicWitness', () => {
  testIf(process.env.TEST_PENTAIR)('Witnessing [no config]', async () => {
    const witness = await PentairScreenlogicWitness.create({ account: await HDWallet.random() })
    const [observation] = await witness.observe()
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  })
})
