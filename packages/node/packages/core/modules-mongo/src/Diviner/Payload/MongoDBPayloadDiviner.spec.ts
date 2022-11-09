import { PayloadQueryPayload, PayloadQuerySchema, XyoBoundWitnessWithPartialMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBPayloadDiviner } from './MongoDBPayloadDiviner'

describe('MongoDBPayloadDiviner', () => {
  let sdk: BaseMongoSdk<XyoPayloadWithMeta>
  let sut: MongoDBPayloadDiviner
  beforeEach(() => {
    sdk = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
    sut = new MongoDBPayloadDiviner(sdk)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: PayloadQueryPayload = { limit: 1, schema: PayloadQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBeDefined()
        expect(actual.schema).toBeString()
      })
    })
  })
})
