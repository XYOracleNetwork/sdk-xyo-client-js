import { assertEx } from '@xylabs/sdk-js'
import dotenv from 'dotenv'
import { v4 } from 'uuid'

import { XyoPayload } from '../models'
import { XyoPayloadBuilder } from '../Payload'
import { XyoArchivistPayloadMongoSdk } from './PayloadSdk'

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
    archive
  )
}

const getPayloads = (number = 5) => {
  return new Array(number).fill(0).map((_) => {
    return new XyoPayloadBuilder({ schema }).fields({ prop: v4() }).build()
  })
}

const describeSkipIfNoDB = process.env.MONGO_CONNECTION_STRING ? describe : describe.skip

describeSkipIfNoDB('XyoArchivistPayloadMongoSdk', () => {
  const numPayloads = 20
  const limit = 10
  const sdk = getMongoSdk('test')
  const payloads = getPayloads(numPayloads)
  beforeAll(async () => {
    await sdk.insertMany(payloads)
  })
  describe('findAfter', () => {
    it('uses an index to perform the query', async () => {
      const plan = await sdk.findAfterPlan(0, limit)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
  })
  describe('findBefore', () => {
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
    let payload: XyoPayload | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = payloads[Math.floor(Math.random() * payloads.length)]?._hash || ''
      expect(hash).toBeTruthy()
      payload = (await sdk.findByHash(hash))[0]
      expect(payload).toBeDefined()
      timestamp = payload?._timestamp || 0
      expect(timestamp).toBeTruthy()
    })
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
  describe('findAfterHash', () => {
    let payload: XyoPayload | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = payloads[0]?._hash || ''
      expect(hash).toBeTruthy()
      payload = (await sdk.findByHash(hash))[0]
      expect(payload).toBeDefined()
      timestamp = payload?._timestamp || 0
      expect(timestamp).toBeTruthy()
    })
    it('Finds all records after the specified hash', async () => {
      const actual = await sdk.findAfterHash(hash, limit)
      expect(actual).toBeSortedBy('_timestamp', { descending: true })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
    })
    it('Finds all records after the specified hash/timestamp', async () => {
      const actual = await sdk.findAfterHash(hash, limit, timestamp)
      expect(actual).toBeSortedBy('_timestamp', { descending: true })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
    })
  })
  describe('findBeforeHash', () => {
    let payload: XyoPayload | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = payloads[payloads.length - 1]?._hash || ''
      expect(hash).toBeTruthy()
      payload = (await sdk.findByHash(hash))[0]
      expect(payload).toBeDefined()
      timestamp = payload?._timestamp || 0
      expect(timestamp).toBeTruthy()
    })
    it('Finds all records before the specified hash', async () => {
      const actual = await sdk.findBeforeHash(hash, limit)
      expect(actual).toBeSortedBy('_timestamp', { descending: true })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
    })
    it('Finds all records before the specified hash/timestamp', async () => {
      const actual = await sdk.findBeforeHash(hash, limit, timestamp)
      expect(actual).toBeSortedBy('_timestamp', { descending: true })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
    })
  })
})
