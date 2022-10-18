import { assertEx } from '@xylabs/assert'
import { XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { Quadkey } from '@xyo-network/quadkey'

import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationWitness, XyoLocationElevationWitnessConfig, XyoLocationElevationWitnessConfigSchema } from './Witness'

describe('XyoLocationElevationWitness', () => {
  test('Witnessing via Observe', async () => {
    const witness = await XyoLocationElevationWitness.create()

    const result = await witness.observe([
      { quadkey: Quadkey.fromLngLat({ lat: 32, lng: 117 }, 24)?.toBase10String() },
      { quadkey: Quadkey.fromLngLat({ lat: 31, lng: 116 }, 24)?.toBase10String() },
      { quadkey: Quadkey.fromLngLat({ lat: 33, lng: 118 }, 24)?.toBase10String() },
    ])

    expect(result[0].elevation).toBeDefined()
    expect(result[1].elevation).toBeDefined()
    expect(result[2].elevation).toBeDefined()
    expect(result[0].elevation === result[1].elevation).toBe(false)
    expect(result[0].elevation === result[2].elevation).toBe(false)
    expect(result[1].elevation === result[2].elevation).toBe(false)
  })

  test('Witnessing via Config', async () => {
    const witness = await XyoLocationElevationWitness.create({
      config: {
        locations: [
          { quadkey: assertEx(Quadkey.fromLngLat({ lat: 32, lng: 117 }, 24)?.toBase10String()), schema: XyoLocationSchema },
          { quadkey: assertEx(Quadkey.fromLngLat({ lat: 31, lng: 116 }, 24)?.toBase10String()), schema: XyoLocationSchema },
          { quadkey: assertEx(Quadkey.fromLngLat({ lat: 33, lng: 118 }, 24)?.toBase10String()), schema: XyoLocationSchema },
        ],
        schema: XyoLocationElevationWitnessConfigSchema,
        targetSchema: XyoLocationElevationSchema,
      } as XyoLocationElevationWitnessConfig,
    })

    const result = await witness.observe()

    expect(result[0].elevation).toBeDefined()
    expect(result[1].elevation).toBeDefined()
    expect(result[2].elevation).toBeDefined()
    expect(result[0].elevation === result[1].elevation).toBe(false)
    expect(result[0].elevation === result[2].elevation).toBe(false)
    expect(result[1].elevation === result[2].elevation).toBe(false)
  })
})
