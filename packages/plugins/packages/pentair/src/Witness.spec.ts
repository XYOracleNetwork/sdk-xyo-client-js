import { PayloadWrapper } from '@xyo-network/payload'

import { XyoPentairScreenlogicWitness } from './Witness'

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoPentairScreenLogicWitness', () => {
  testIf(process.env.TEST_PENTAIR)('Witnessing [no config]', async () => {
    const witness = await XyoPentairScreenlogicWitness.create()
    const [observation] = await witness.observe()
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })
})
