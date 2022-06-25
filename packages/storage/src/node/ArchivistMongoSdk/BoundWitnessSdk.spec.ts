import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount, XyoBoundWitnessBuilder, XyoBoundWitnessWithPartialMeta, XyoPayload, XyoPayloadBuilder } from '@xyo-network/core'
import dotenv from 'dotenv'
import { v4 } from 'uuid'

import { XyoArchivistBoundWitnessMongoSdk } from './BoundWitnessSdk'

const schema = 'network.xyo.temp'
const address = XyoAccount.fromPhrase('test')

const getMongoSdk = (archive: string) => {
  // eslint-disable-next-line import/no-named-as-default-member
  dotenv.config()
  return new XyoArchivistBoundWitnessMongoSdk(
    {
      collection: 'bound_witnesses',
      dbConnectionString: process.env.MONGO_CONNECTION_STRING,
      dbDomain: assertEx(process.env.MONGO_DOMAIN, 'Missing Mongo Domain'),
      dbName: assertEx(process.env.MONGO_DATABASE, 'Missing Mongo Database'),
      dbPassword: assertEx(process.env.MONGO_PASSWORD, 'Missing Mongo Password'),
      dbUserName: assertEx(process.env.MONGO_USERNAME, 'Missing Mongo Username'),
    },
    archive
  )
}

const getBoundWitnesses = (number = 5) => {
  return new Array(number).fill(0).map((_) => {
    return new XyoBoundWitnessBuilder({ inlinePayloads: true })
      .witness(address)
      .payload(new XyoPayloadBuilder<XyoPayload<{ prop: string }>>({ schema }).fields({ prop: v4() }).build())
      .build()
  })
}
const describeSkipIfNoDB = process.env.MONGO_CONNECTION_STRING ? describe : describe.skip

describeSkipIfNoDB('XyoArchivistBoundWitnessMongoSdk', () => {
  const numBoundWitnesses = 20
  const limit = 10
  let sdk: XyoArchivistBoundWitnessMongoSdk
  let boundWitnesses: XyoBoundWitnessWithPartialMeta[] = []
  beforeAll(async () => {
    sdk = getMongoSdk('temp')
    boundWitnesses = getBoundWitnesses(numBoundWitnesses)
    await sdk.insertMany(boundWitnesses)
  })
  describe('findAfter', () => {
    let boundWitness: XyoBoundWitnessWithPartialMeta | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = boundWitnesses[0]?._hash || ''
      expect(hash).toBeTruthy()
      boundWitness = (await sdk.findByHash(hash))[0]
      expect(boundWitness).toBeDefined()
      timestamp = boundWitness?._timestamp || 0
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
    let boundWitness: XyoBoundWitnessWithPartialMeta | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = boundWitnesses[boundWitnesses.length - 1]?._hash || ''
      expect(hash).toBeTruthy()
      boundWitness = (await sdk.findByHash(hash))[0]
      expect(boundWitness).toBeDefined()
      timestamp = boundWitness?._timestamp || 0
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
    let boundWitness: XyoBoundWitnessWithPartialMeta | undefined
    let hash = ''
    let timestamp = 0
    beforeAll(async () => {
      hash = boundWitnesses[Math.floor(Math.random() * boundWitnesses.length)]?._hash || ''
      expect(hash).toBeTruthy()
      boundWitness = (await sdk.findByHash(hash))[0]
      expect(boundWitness).toBeDefined()
      timestamp = boundWitness?._timestamp || 0
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
