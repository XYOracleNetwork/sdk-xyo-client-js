import { assertEx } from '@xylabs/assert'
import { describeIf } from '@xylabs/jest-helpers'
import { uuid } from '@xyo-network/core'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import dotenv from 'dotenv'

import { PayloadWithPartialMeta } from '../Meta'
import { XyoArchivistPayloadMongoSdk } from '../PayloadSdk'

const schema = 'network.xyo.temp'

const getMongoSdk = (archive: string) => {
  // eslint-disable-next-line import/no-named-as-default-member
  dotenv.config()
  return new XyoArchivistPayloadMongoSdk(
    {
      collection: 'payloads',
      dbConnectionString: process.env.MONGO_CONNECTION_STRING,
      dbDomain: assertEx(process.env.MONGO_DOMAIN, 'Missing Mongo Domain'),
      dbName: assertEx(process.env.MONGO_DATABASE, 'Missing Mongo Database'),
      dbPassword: assertEx(process.env.MONGO_PASSWORD, 'Missing Mongo Password'),
      dbUserName: assertEx(process.env.MONGO_USERNAME, 'Missing Mongo Username'),
    },
    archive,
  )
}

const getPayloads = (number = 5): Payload[] => {
  return new Array(number).fill(0).map((_val, idx) => {
    const payload = new PayloadBuilder({ schema }).fields({ prop: uuid() }).build(true)
    payload._timestamp = idx + 1
    return payload
  })
}

describeIf(process.env.MONGO_CONNECTION_STRING)('XyoArchivistPayloadMongoSdk', () => {
  const numPayloads = 20
  const limit = 10
  const payloads: PayloadWithPartialMeta[] = getPayloads(numPayloads)
  const sdk: XyoArchivistPayloadMongoSdk = getMongoSdk('test')
  beforeAll(async () => {
    for (let payload = 0; payload < payloads.length; payload++) {
      await sdk.insert(payloads[payload])
    }
  })
  describe('findAfter', () => {
    const payload: PayloadWithPartialMeta = payloads[0]
    const firstPayloadHash = PayloadWrapper.hash(payload)
    const timestamp = assertEx(payload._timestamp)
    it('finds all records after the specified timestamp', async () => {
      const actual = await sdk.findAfter(timestamp, limit)
      expect(actual.length).toBe(limit)
      expect(actual).toBeSortedBy('_timestamp', { descending: false })
      const hashes = actual?.map?.((p) => p._hash)
      expect(hashes).not.toContain(firstPayloadHash)
    })
    it('uses an index to perform the query', async () => {
      const plan = await sdk.findAfterPlan(timestamp, limit)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
  })
  describe('findBefore', () => {
    const payload: PayloadWithPartialMeta = payloads[payloads.length - 1]
    const hash = PayloadWrapper.hash(payload)
    const timestamp = assertEx(payload._timestamp)
    it('finds all records before the specified timestamp', async () => {
      const actual = await sdk.findBefore(timestamp, limit)
      expect(actual.length).toBe(limit)
      expect(actual).toBeSortedBy('_timestamp', { descending: true })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
    })
    it('uses an index to perform the query', async () => {
      const plan = await sdk.findBeforePlan(Date.now(), limit)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
  })
  describe('findRecent', () => {
    it('uses an index to perform the query', async () => {
      const plan = await sdk.findRecentPlan(limit)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
  })
  describe('findByHash', () => {
    const payload = payloads[Math.floor(Math.random() * payloads.length)]
    const hash = PayloadWrapper.hash(payload)
    const timestamp = assertEx(payload._timestamp)
    it('uses an index to perform the query by hash', async () => {
      const plan = await sdk.findByHashPlan(hash)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
    it('uses an index to perform the query by hash/timestamp', async () => {
      const plan = await sdk.findByHashPlan(hash, timestamp)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
  })
})
