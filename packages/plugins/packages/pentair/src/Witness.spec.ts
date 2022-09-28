import { XyoPentairScreenlogicWitness } from './Witness'

describe('XyoPentairScreenLogicWitness', () => {
  test('Witnessing', async () => {
    const witness = new XyoPentairScreenlogicWitness()
    witness.initialize()
    await witness.observe()
    witness.shutdown()
  })
})
