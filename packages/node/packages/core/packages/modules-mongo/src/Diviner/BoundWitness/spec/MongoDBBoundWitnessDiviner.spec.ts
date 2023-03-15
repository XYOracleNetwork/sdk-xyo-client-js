import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import {
  BoundWitnessQueryPayload,
  BoundWitnessQuerySchema,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBBoundWitnessDiviner } from '../MongoDBBoundWitnessDiviner'

describe('MongoDBBoundWitnessDiviner', () => {
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBBoundWitnessDiviner
  beforeAll(async () => {
    sut = await MongoDBBoundWitnessDiviner.create({
      boundWitnessSdk,
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: BoundWitnessQueryPayload = { limit: 1, schema: BoundWitnessQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe(XyoBoundWitnessSchema)
      })
    })
  })
})
