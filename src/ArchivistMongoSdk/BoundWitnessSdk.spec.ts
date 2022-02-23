import { assertEx } from '@xylabs/sdk-js'
import dotenv from 'dotenv'
import { v4 } from 'uuid'

import { XyoAddress } from '../Address'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoPayloadBuilder } from '../Payload'
import { XyoArchivistBoundWitnessMongoSdk } from './BoundWitnessSdk'

const schema = 'network.xyo.temp'
const address = XyoAddress.fromPhrase('test')

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
      .payload(new XyoPayloadBuilder({ schema }).fields({ prop: v4() }).build())
      .build()
  })
}

describe('XyoArchivistBoundWitnessMongoSdk', () => {
  describe('findAfter', () => {
    it('uses an index to perform the query', async () => {
      if (process.env.MONGO_CONNECTION_STRING) {
        const sdk = getMongoSdk('test')
        const limit = 100
        const plan = await sdk.findAfterPlan(limit)
        expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
        expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
        expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
        expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
      }
    })
  })
  describe('findBefore', () => {
    it('uses an index to perform the query', async () => {
      if (process.env.MONGO_CONNECTION_STRING) {
        const sdk = getMongoSdk('test')
        const limit = 100
        const plan = await sdk.findBeforePlan(limit)
        expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
        expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
        expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
        expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
      }
    })
  })
  describe('findRecent', () => {
    it('uses an index to perform the query', async () => {
      if (process.env.MONGO_CONNECTION_STRING) {
        const sdk = getMongoSdk('test')
        const limit = 100
        const plan = await sdk.findRecentPlan(limit)
        expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
        expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(limit)
        expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(limit)
        expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(limit)
      }
    })
  })
  describe('findAfterHash', () => {
    it('Finds all records after the specified hash', async () => {
      if (process.env.MONGO_CONNECTION_STRING) {
        const sdk = getMongoSdk('test')
        const numBoundWitnesses = 5
        const boundWitnesses = getBoundWitnesses(numBoundWitnesses)
        await sdk.insertMany(boundWitnesses)
        const first = boundWitnesses.shift()
        expect(first).toBeDefined()
        const hash = first?._hash || ''
        expect(hash).toBeTruthy()
        const timestamp = first?._timestamp || 0
        expect(timestamp).toBeTruthy()
        const actual = await sdk.findAfterHash(hash)
        expect(actual).toBeSortedBy('_timestamp', { descending: true })
        const hashes = actual?.map?.((bw) => bw._hash)
        expect(hashes).not.toContain(hash)
      }
    })
  })
  describe('findBeforeHash', () => {
    it('Finds all records before the specified hash', async () => {
      if (process.env.MONGO_CONNECTION_STRING) {
        const sdk = getMongoSdk('test')
        const numBoundWitnesses = 5
        const boundWitnesses = getBoundWitnesses(numBoundWitnesses)
        await sdk.insertMany(boundWitnesses)
        const last = boundWitnesses.pop()
        expect(last).toBeDefined()
        const hash = last?._hash || ''
        expect(hash).toBeTruthy()
        const timestamp = last?._timestamp || 0
        expect(timestamp).toBeTruthy()
        const actual = await sdk.findBeforeHash(hash)
        expect(actual).toBeSortedBy('_timestamp', { descending: true })
        const hashes = actual?.map?.((bw) => bw._hash)
        expect(hashes).not.toContain(hash)
      }
    })
  })
})
