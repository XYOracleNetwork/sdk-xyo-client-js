import { XyoAccount } from '@xyo-network/account'
import {
  AddressHistoryQueryPayload,
  AddressHistoryQuerySchema,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBAddressHistoryDiviner } from './MongoDBAddressHistoryDiviner'

describe('MongoDBAddressHistoryDiviner', () => {
  const phrase = process.env.ACCOUNT_SEED
  const address = new XyoAccount({ phrase }).addressValue.hex
  let sdk: BaseMongoSdk<XyoBoundWitnessWithMeta>
  let sut: MongoDBAddressHistoryDiviner
  beforeEach(() => {
    sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    sut = new MongoDBAddressHistoryDiviner(sdk)
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
