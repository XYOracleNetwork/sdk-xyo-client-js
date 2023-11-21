import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import {
  PayloadStatsDivinerConfigSchema,
  PayloadStatsDivinerSchema,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
  PayloadStatsQuerySchema,
} from '@xyo-network/diviner-payload-stats-model'
import { hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { JobQueue } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { MongoDBPayloadStatsDiviner } from '../MongoDBPayloadStatsDiviner'

/**
 * @group mongo
 */

describeIf(hasMongoDBConfig())('MongoDBPayloadStatsDiviner', () => {
  const phrase = 'guide drop pole matter mandate sand social chest toe scene primary alien'
  let address: string
  const logger = mock<Console>()

  const jobQueue: MockProxy<JobQueue> = mock<JobQueue>()
  let sut: MongoDBPayloadStatsDiviner
  beforeAll(async () => {
    address = (await Account.create({ phrase })).address
    sut = await MongoDBPayloadStatsDiviner.create({
      account: Account.randomSync(),
      config: { schema: PayloadStatsDivinerConfigSchema },
      jobQueue,
      logger,
    })
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: PayloadStatsQueryPayload = { address, schema: PayloadStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as PayloadStatsPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(PayloadStatsDivinerSchema)
        expect(actual.count).toBeNumber()
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: PayloadStatsQueryPayload = { schema: PayloadStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as PayloadStatsPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(PayloadStatsDivinerSchema)
        expect(actual.count).toBeNumber()
      })
    })
  })
})
