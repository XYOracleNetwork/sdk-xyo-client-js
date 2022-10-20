import { XyoPentairScreenlogicWitness } from './Witness'

describe('XyoPentairScreenLogicWitness', () => {
  test('Witnessing', async () => {
    const witness = await XyoPentairScreenlogicWitness.create()
    await witness.observe()
  })
})
