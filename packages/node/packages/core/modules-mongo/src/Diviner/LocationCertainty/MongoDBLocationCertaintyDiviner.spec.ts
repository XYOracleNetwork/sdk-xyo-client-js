import { XyoAccount } from '@xyo-network/account'
import { XyoLocationPayload, XyoLocationSchema } from '@xyo-network/location-payload-plugin'
import { LocationCertaintyPayload, LocationCertaintySchema } from '@xyo-network/node-core-model'
import { Logger } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { MongoDBLocationCertaintyDiviner } from './MongoDBLocationCertaintyDiviner'

describe('MongoDBLocationCertaintyDiviner', () => {
  let logger: MockProxy<Logger>
  let account: XyoAccount
  let sut: MongoDBLocationCertaintyDiviner
  beforeEach(() => {
    logger = mock<Logger>()
    account = XyoAccount.random()

    sut = new MongoDBLocationCertaintyDiviner(logger, account)
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
