import { XyoPentairScreenlogicWitness } from './Witness'

describe('XyoPentairScreenLogicWitness', () => {
  test('Witnessing', async () => {
    const witness = new XyoPentairScreenlogicWitness()
    await witness.start()
    await witness.observe()
    await witness.stop()
  })
})
