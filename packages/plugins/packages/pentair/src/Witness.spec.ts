import { PayloadWrapper } from '@xyo-network/payload'

import { XyoPentairScreenlogicWitness } from './Witness'

describe('XyoPentairScreenLogicWitness', () => {
  test('Witnessing [no config]', async () => {
    const witness = await XyoPentairScreenlogicWitness.create()
    const [observation] = await witness.observe()
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })
})
