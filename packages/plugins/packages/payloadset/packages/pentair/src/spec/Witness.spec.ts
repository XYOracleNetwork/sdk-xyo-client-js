import { testIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { PentairScreenlogicWitness } from '../Witness'

describe('PentairScreenLogicWitness', () => {
  testIf(process.env.TEST_PENTAIR === 'true')('Witnessing [no config]', async () => {
    const witness = await PentairScreenlogicWitness.create({ account: Account.randomSync() })
    const [observation] = await witness.observe()
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  })
})
