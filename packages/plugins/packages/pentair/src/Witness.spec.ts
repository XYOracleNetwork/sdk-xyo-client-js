import { XyoPentairScreenlogicWitness } from './Witness'

describe('XyoPentairScreenLogicWitness', () => {
  test('Witnessing', async () => {
    const witness = await XyoPentairScreenlogicWitness.create()
    await witness.start()
    await witness.observe()
    await witness.stop()
  })
})
