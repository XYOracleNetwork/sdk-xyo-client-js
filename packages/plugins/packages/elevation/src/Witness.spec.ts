import { Quadkey } from '@xyo-network/quadkey'

import { XyoLocationElevationWitness } from './Witness'

describe('XyoLocationElevationWitness', () => {
  test('Witnessing', async () => {
    const witness = new XyoLocationElevationWitness()
    const result = await witness.observe([
      { quadkey: Quadkey.fromLngLat({ lat: 32, lng: 117 }, 24)?.toBase10String() },
      { quadkey: Quadkey.fromLngLat({ lat: 31, lng: 116 }, 24)?.toBase10String() },
      { quadkey: Quadkey.fromLngLat({ lat: 33, lng: 118 }, 24)?.toBase10String() },
    ])

    console.log(`Elevation: ${JSON.stringify(result, null, 2)}`)

    expect(result[0].elevation).toBeDefined()
    expect(result[1].elevation).toBeDefined()
    expect(result[2].elevation).toBeDefined()
    expect(result[0].elevation === result[1].elevation).toBe(false)
    expect(result[0].elevation === result[2].elevation).toBe(false)
    expect(result[1].elevation === result[2].elevation).toBe(false)
  })
})
