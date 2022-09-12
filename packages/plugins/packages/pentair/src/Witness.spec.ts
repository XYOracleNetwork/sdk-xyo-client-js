import { XyoPentairScreenlogicWitness } from './Witness'

describe('XyoPentairScreenLopgicWitness', () => {
  test('Witnessing', async () => {
    const witness = new XyoPentairScreenlogicWitness()
    witness.initialize()
    const result = await witness.observe()
    witness.shutdown()

    console.log(`Result: ${JSON.stringify(result, null, 2)}`)
  })
})
