import { XyoAccount } from '@xyo-network/account'
import { XyoArchivist, XyoMemoryArchivist } from '@xyo-network/archivist'
import { XyoLocationPayload, XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { Logger } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { LocationCertaintyPayload } from '../Payload'
import { LocationCertaintySchema } from '../Schema'
import { LocationCertaintyDiviner } from './Diviner'

describe('MongoDBLocationCertaintyDiviner', () => {
  let logger: MockProxy<Logger>
  let account: XyoAccount
  let payloadsArchivist: XyoArchivist
  let sut: LocationCertaintyDiviner
  beforeEach(() => {
    logger = mock<Logger>()
    account = XyoAccount.random()
    payloadsArchivist = new XyoMemoryArchivist()
    sut = new LocationCertaintyDiviner(undefined, account, () => payloadsArchivist, logger)
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
