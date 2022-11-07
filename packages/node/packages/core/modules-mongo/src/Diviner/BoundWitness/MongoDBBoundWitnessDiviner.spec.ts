import { XyoAccount } from '@xyo-network/account'
import {
  BoundWitnessQueryPayload,
  BoundWitnessQuerySchema,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Logger } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBBoundWitnessDiviner } from './MongoDBBoundWitnessDiviner'

describe('MongoDBBoundWitnessDiviner', () => {
  let logger: MockProxy<Logger>
  let account: XyoAccount
  let sdk: BaseMongoSdk<XyoBoundWitnessWithMeta>
  let sut: MongoDBBoundWitnessDiviner
  beforeEach(() => {
    logger = mock<Logger>()
    account = XyoAccount.random()
    sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    sut = new MongoDBBoundWitnessDiviner(logger, account, sdk)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: BoundWitnessQueryPayload = { limit: 1, schema: BoundWitnessQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe('network.xyo.boundwitness')
      })
    })
  })
})
