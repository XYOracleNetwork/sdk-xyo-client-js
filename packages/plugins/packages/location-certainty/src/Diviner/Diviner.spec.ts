import { XyoArchivist, XyoMemoryArchivist } from '@xyo-network/archivist'
import { XyoLocationPayload, XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { XyoModuleResolver } from '@xyo-network/module'

import { LocationCertaintyPayload } from '../Payload'
import { LocationCertaintySchema } from '../Schema'
import { LocationCertaintyDiviner } from './Diviner'

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
      })
    })
  })
})
