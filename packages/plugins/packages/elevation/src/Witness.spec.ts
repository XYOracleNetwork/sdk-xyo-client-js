import { XyoElevationWitness } from './Witness'

describe('XyoElevationWitness', () => {
  test('Witnessing', async () => {
    const witness = new XyoElevationWitness()
    const result = await witness.observe({ latitude: 32, longitude: 117 })

    console.log(`Elevation: ${JSON.stringify(result, null, 2)}`)

    expect(result.elevation).toBeDefined()
  })
})
