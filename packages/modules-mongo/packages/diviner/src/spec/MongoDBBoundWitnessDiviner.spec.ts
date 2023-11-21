import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import {
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerQueryPayload,
  BoundWitnessDivinerQuerySchema,
} from '@xyo-network/diviner-boundwitness-model'
import { COLLECTIONS, hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BoundWitnessWithMeta, BoundWitnessWithPartialMeta } from '@xyo-network/payload-mongodb'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { MongoDBBoundWitnessDiviner } from '../MongoDBBoundWitnessDiviner'

/**
 * @group mongo
 */

describeIf(hasMongoDBConfig())('MongoDBBoundWitnessDiviner', () => {
  const phrase = 'reflect dash pear scatter kiwi sock ability muffin clever effort enroll school'
  let account: AccountInstance
  const logger = mock<Console>()
  const boundWitnessSdkConfig = {
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  }
  const boundWitnessSdk = new BaseMongoSdk<BoundWitnessWithMeta>(boundWitnessSdkConfig)
  let sut: MongoDBBoundWitnessDiviner
  beforeAll(async () => {
    account = await Account.create({ phrase })
    sut = await MongoDBBoundWitnessDiviner.create({
      account,
      boundWitnessSdkConfig,
      config: { schema: BoundWitnessDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = (await new BoundWitnessBuilder().payload(payload).witness(account).build())[0]
    await boundWitnessSdk.insertOne(bw as unknown as BoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: BoundWitnessDivinerQueryPayload = { limit: 1, schema: BoundWitnessDivinerQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as BoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe(BoundWitnessSchema)
      })
    })
  })
})
