import { XyoLocationPayload, XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { LocationCertaintyPayload, LocationCertaintySchema } from '@xyo-network/node-core-model'

import { MongoDBLocationCertaintyDiviner } from './MongoDBLocationCertaintyDiviner'

describe('MongoDBLocationCertaintyDiviner', () => {
  let sut: MongoDBLocationCertaintyDiviner
  beforeEach(() => {
    sut = new MongoDBLocationCertaintyDiviner()
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
      })
    })
  })
})
