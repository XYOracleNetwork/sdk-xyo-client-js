import { XyoAccount } from '@xyo-network/account'
import {
  AddressHistoryQueryPayload,
  AddressHistoryQuerySchema,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Logger } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBAddressHistoryDiviner } from './MongoDBAddressHistoryDiviner'

describe('MongoDBAddressHistoryDiviner', () => {
  const phrase = process.env.ACCOUNT_SEED
  const address = new XyoAccount({ phrase }).addressValue.hex
  let logger: MockProxy<Logger>
  let account: XyoAccount
  let sdk: BaseMongoSdk<XyoBoundWitnessWithMeta>
  let sut: MongoDBAddressHistoryDiviner
  beforeEach(() => {
    logger = mock<Logger>()
    account = XyoAccount.random()
    sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    sut = new MongoDBAddressHistoryDiviner(logger, account, sdk)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressHistoryQueryPayload = { address, limit: 1, schema: AddressHistoryQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe('network.xyo.boundwitness')
      })
    })
  })
})
