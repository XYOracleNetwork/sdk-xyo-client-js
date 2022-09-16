import { assertEx } from '@xylabs/sdk-js'
import { uuid } from '@xyo-network/core'
import { PayloadWrapper, XyoPayloadBuilder } from '@xyo-network/payload'
import dotenv from 'dotenv'

import { XyoPayloadWithPartialMeta } from './Meta'
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
    archive,
  )
}

const getPayloads = (number = 5) => {
  return new Array(number).fill(0).map((_) => {
    return new XyoPayloadBuilder({ schema }).fields({ prop: uuid() }).build()
  })
}

const describeSkipIfNoDB = process.env.MONGO_CONNECTION_STRING ? describe : describe.skip

describeSkipIfNoDB('XyoArchivistPayloadMongoSdk', () => {
  const numPayloads = 20
  const limit = 10
  let sdk: XyoArchivistPayloadMongoSdk
  let payloads: XyoPayloadWithPartialMeta[] = []
  beforeAll(async () => {
    sdk = getMongoSdk('test')
    payloads = getPayloads(numPayloads)
    await payloads.map(async (p) => await sdk.insert(p))
  })
  describe('findAfter', () => {
    let payload: XyoPayloadWithPartialMeta | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = PayloadWrapper.hash(payloads[0])
      expect(hash).toBeTruthy()
      payload = (await sdk.findByHash(hash))[0]
      expect(payload).toBeDefined()
      timestamp = payload?._timestamp || 0
      expect(timestamp).toBeTruthy()
    })
    it('finds all records after the specified timestamp', async () => {
      const actual = await sdk.findAfter(0, limit)
      expect(actual.length).toBe(limit)
      expect(actual).toBeSortedBy('_timestamp', { descending: false })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
    })
    it('uses an index to perform the query', async () => {
      const plan = await sdk.findAfterPlan(0, limit)
      expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
      expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
      expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
    })
  })
  describe('findBefore', () => {
    let payload: XyoPayloadWithPartialMeta | undefined
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
    let payload: XyoPayloadWithPartialMeta | undefined
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
})
