import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  BoundWitnessStatsQueryPayload,
  BoundWitnessStatsQuerySchema,
  BoundWitnessStatsSchema,
  BoundWitnessWithMeta,
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBBoundWitnessStatsDiviner, MongoDBBoundWitnessStatsDivinerConfigSchema } from '../MongoDBBoundWitnessStatsDiviner'

describe('MongoDBBoundWitnessStatsDiviner', () => {
  const phrase = 'temp'
  const account = new Account({ phrase })
  const address = account.addressValue.hex
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBBoundWitnessStatsDiviner
  beforeAll(async () => {
    sut = (await MongoDBBoundWitnessStatsDiviner.create({
      boundWitnessSdk,
      config: { schema: MongoDBBoundWitnessStatsDivinerConfigSchema },
      logger,
    })) as MongoDBBoundWitnessStatsDiviner
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = new BoundWitnessBuilder().payload(payload).witness(account).build()[0]
    await boundWitnessSdk.insertOne(bw as unknown as BoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: BoundWitnessStatsQueryPayload = { address, schema: BoundWitnessStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(BoundWitnessStatsSchema)
        expect(actual.count).toBeNumber()
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: BoundWitnessStatsQueryPayload = { schema: BoundWitnessStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(BoundWitnessStatsSchema)
        expect(actual.count).toBeNumber()
      })
    })
  })
})
