import { testIf } from '@xylabs/jest-helpers'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoPentairScreenlogicWitness } from '../Witness'

describe('XyoPentairScreenLogicWitness', () => {
  testIf(process.env.TEST_PENTAIR)('Witnessing [no config]', async () => {
    const witness = await XyoPentairScreenlogicWitness.create()
    const [observation] = await witness.observe()
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  })
})
