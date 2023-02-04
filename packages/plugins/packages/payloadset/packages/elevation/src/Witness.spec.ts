import { assertEx } from '@xylabs/assert'
import { ElevationPayload } from '@xyo-network/elevation-payload-plugin'
import { LocationSchema } from '@xyo-network/location-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Quadkey } from '@xyo-network/quadkey'

import { ElevationWitness, ElevationWitnessConfigSchema } from './Witness'

const locations = [
  { quadkey: assertEx(Quadkey.fromLngLat({ lat: 32.7157, lng: -117.1611 }, 16)?.base10String), schema: LocationSchema }, // San Diego
  { quadkey: assertEx(Quadkey.fromLngLat({ lat: 39.7392, lng: -104.9903 }, 16)?.base10String), schema: LocationSchema }, //Denver
  { quadkey: assertEx(Quadkey.fromLngLat({ lat: 41.8781, lng: -87.6298 }, 16)?.base10String), schema: LocationSchema }, //Chicago
]

describe('ElevationWitness', () => {
  test('Witnessing via Observe', async () => {
    const witness = await ElevationWitness.create({
      config: {
        files: {
          northEast: './packages/plugins/packages/payloadset/packages/elevation/.testdata/SRTM_NE_250m.tif',
          southEast: './packages/plugins/packages/payloadset/packages/elevation/.testdata/SRTM_SE_250m.tif',
          west: './packages/plugins/packages/payloadset/packages/elevation/.testdata/SRTM_W_250m.tif',
        },
        schema: ElevationWitnessConfigSchema,
      },
    })
    const result = (await witness.observe(locations)) as ElevationPayload[]
    validateResult(result)
  })

  test('Witnessing via Config', async () => {
    const witness = await ElevationWitness.create({
      config: {
        files: {
          northEast: './packages/plugins/packages/payloadset/packages/elevation/.testdata/SRTM_NE_250m.tif',
          southEast: './packages/plugins/packages/payloadset/packages/elevation/.testdata/SRTM_SE_250m.tif',
          west: './packages/plugins/packages/payloadset/packages/elevation/.testdata/SRTM_W_250m.tif',
        },
        locations,
        schema: ElevationWitnessConfigSchema,
      },
    })
    const result = (await witness.observe()) as ElevationPayload[]
    validateResult(result)
  })
})

const validateResult = (result: ElevationPayload[]) => {
  expect(result[0].elevation).toBeDefined()
  expect(result[1].elevation).toBeDefined()
  expect(result[2].elevation).toBeDefined()
  expect(result[0].elevation === result[1].elevation).toBe(false)
  expect(result[0].elevation === result[2].elevation).toBe(false)
  expect(result[1].elevation === result[2].elevation).toBe(false)
  expect(new PayloadWrapper(result[0]).valid).toBe(true)
  expect(new PayloadWrapper(result[1]).valid).toBe(true)
  expect(new PayloadWrapper(result[2]).valid).toBe(true)
}
