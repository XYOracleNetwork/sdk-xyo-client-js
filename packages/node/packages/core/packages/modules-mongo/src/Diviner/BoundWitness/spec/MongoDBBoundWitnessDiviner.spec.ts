import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import {
  BoundWitnessQueryPayload,
  BoundWitnessQuerySchema,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBBoundWitnessDiviner } from '../MongoDBBoundWitnessDiviner'

describe('MongoDBBoundWitnessDiviner', () => {
  const phrase = 'temp'
  const account = new Account({ phrase })
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBBoundWitnessDiviner
  beforeAll(async () => {
    sut = await MongoDBBoundWitnessDiviner.create({
      account,
      boundWitnessSdk,
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = new BoundWitnessBuilder().payload(payload).witness(account).build()[0]
    await boundWitnessSdk.insertOne(bw as unknown as XyoBoundWitnessWithMeta)
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
