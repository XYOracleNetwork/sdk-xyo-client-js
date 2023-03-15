import { Account } from '@xyo-network/account'
import { BoundWitnessArchivist, PayloadArchivist, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../../collections'
import { getBaseMongoSdk } from '../../../../Mongo'
import { CoinCurrentUserWitnessPayload, CoinCurrentUserWitnessSchema, CoinUserLocationsDiviner } from '../UserLocationsDiviner'

describe('CoinUserLocationsDiviner', () => {
  const account = Account.random()
  const payloadsArchivist = mock<PayloadArchivist>()
  const bwArchivist = mock<BoundWitnessArchivist>()
  const sdk = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const logger = mock<Console>()
  let sut: CoinUserLocationsDiviner
  beforeAll(() => {
    sut = new CoinUserLocationsDiviner(account, payloadsArchivist, bwArchivist, sdk)
    sut.params.logger = logger
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: CoinCurrentUserWitnessPayload = { schema: CoinCurrentUserWitnessSchema, uid: 'test' }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(0)
        //const actual = result[0] as XyoPayload
        //expect(actual).toBeObject()
        //expect(actual.schema).toBe(XyoLocationSchema)
      })
    })
  })
})
