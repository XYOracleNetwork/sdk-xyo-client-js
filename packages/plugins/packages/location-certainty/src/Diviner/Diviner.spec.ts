import { AbstractArchivist, MemoryArchivist } from '@xyo-network/archivist'
import { XyoLocationPayload, XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { XyoModuleResolver } from '@xyo-network/module'

import { LocationCertaintyPayload } from '../Payload'
import { LocationCertaintySchema } from '../Schema'
import { LocationCertaintyDivinerConfigSchema } from './Config'
import { LocationCertaintyDiviner } from './Diviner'

const sample1: XyoLocationPayload[] = [
  {
    altitude: -5,
    latitude: 32.71664,
    longitude: -117.12033,
    schema: XyoLocationSchema,
  },
  {
    altitude: -9,
    latitude: 32.7174,
    longitude: -117.11674,
    schema: XyoLocationSchema,
  },
  {
    altitude: -11,
    latitude: 32.71788,
    longitude: -117.11377,
    schema: XyoLocationSchema,
  },
]

const sample2: XyoLocationPayload[] = [
  {
    altitude: 50,
    latitude: 32.71664,
    longitude: -117.12033,
    schema: XyoLocationSchema,
  },
  {
    altitude: 53,
    latitude: 32.7174,
    longitude: -117.11674,
    schema: XyoLocationSchema,
  },
  {
    altitude: 55,
    latitude: 32.71788,
    longitude: -117.11377,
    schema: XyoLocationSchema,
  },
]

const sample3: XyoLocationPayload[] = [
  {
    altitude: 151,
    latitude: 32.71664,
    longitude: -117.12033,
    schema: XyoLocationSchema,
  },
  {
    altitude: 163,
    latitude: 32.7174,
    longitude: -117.11674,
    schema: XyoLocationSchema,
  },
  {
    altitude: 168,
    latitude: 32.71788,
    longitude: -117.11377,
    schema: XyoLocationSchema,
  },
]

describe('MongoDBLocationCertaintyDiviner', () => {
  let payloadsArchivist: AbstractArchivist
  let sut: LocationCertaintyDiviner
  beforeEach(async () => {
    payloadsArchivist = await MemoryArchivist.create()
    const params = {
      config: {
        schema: LocationCertaintyDivinerConfigSchema,
        targetSchema: LocationCertaintySchema,
      },
      resolver: new XyoModuleResolver().add(payloadsArchivist),
    }
    sut = await LocationCertaintyDiviner.create(params)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const noLocations: XyoLocationPayload[] = []
        const noLocationsResult = await sut.divine(noLocations)
        expect(noLocationsResult).toBeArrayOfSize(0)
        const locations: XyoLocationPayload[] = [
          { altitude: 5, quadkey: '0203', schema: XyoLocationSchema },
          { altitude: 300, quadkey: '0102', schema: XyoLocationSchema },
        ]
        const locationsResult = await sut.divine(locations)
        expect(locationsResult).toBeArrayOfSize(1)
        const actual = locationsResult[0] as LocationCertaintyPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(LocationCertaintySchema)

        const locationsResult1 = (await sut.divine(sample1)) as LocationCertaintyPayload[]
        const locationsResult2 = (await sut.divine(sample2)) as LocationCertaintyPayload[]
        const locationsResult3 = (await sut.divine(sample3)) as LocationCertaintyPayload[]
        ;[locationsResult1, locationsResult2, locationsResult3].map(validateLocationResult)
      })
    })
  })
})

const validateLocationResult = (results: LocationCertaintyPayload[]) => {
  expect(results).toBeArrayOfSize(1)
  const [result] = results
  expect(result).toBeObject()
  expect(result.schema).toBe(LocationCertaintySchema)
  expect(result.altitude).toBeObject()
  expect(result.altitude.max).toBeNumber()
  expect(result.altitude.mean).toBeNumber()
  expect(result.altitude.min).toBeNumber()
  expect(result.elevation).toBeObject()
  expect(result.elevation.max).toBeNumber()
  expect(result.elevation.mean).toBeNumber()
  expect(result.elevation.min).toBeNumber()
  expect(result.variance).toBeObject()
  expect(result.variance.max).toBeNumber()
  expect(result.variance.mean).toBeNumber()
  expect(result.variance.min).toBeNumber()
}
