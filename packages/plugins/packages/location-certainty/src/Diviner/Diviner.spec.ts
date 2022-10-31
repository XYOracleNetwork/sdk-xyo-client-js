import { XyoArchivist, XyoMemoryArchivist } from '@xyo-network/archivist'
import { XyoLocationPayload, XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { XyoModuleResolver } from '@xyo-network/module'

import { LocationCertaintyPayload } from '../Payload'
import { LocationCertaintySchema } from '../Schema'
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
  let payloadsArchivist: XyoArchivist
  let sut: LocationCertaintyDiviner
  beforeEach(async () => {
    payloadsArchivist = await XyoMemoryArchivist.create()
    sut = await LocationCertaintyDiviner.create({ resolver: new XyoModuleResolver().add(payloadsArchivist) })
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

        const locationsResult1 = await sut.divine(sample1)
        const locationsResult2 = await sut.divine(sample2)
        const locationsResult3 = await sut.divine(sample3)

        console.log(JSON.stringify(locationsResult1, null, 2))
        console.log(JSON.stringify(locationsResult2, null, 2))
        console.log(JSON.stringify(locationsResult3, null, 2))
      })
    })
  })
})
