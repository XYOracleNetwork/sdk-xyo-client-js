import {
  BoundWitnessQueryPayload,
  BoundWitnessQuerySchema,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBBoundWitnessDiviner } from './MongoDBBoundWitnessDiviner'

describe('MongoDBBoundWitnessDiviner', () => {
  let sdk: BaseMongoSdk<XyoBoundWitnessWithMeta>
  let sut: MongoDBBoundWitnessDiviner
  beforeEach(() => {
    sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    sut = new MongoDBBoundWitnessDiviner(sdk)
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
