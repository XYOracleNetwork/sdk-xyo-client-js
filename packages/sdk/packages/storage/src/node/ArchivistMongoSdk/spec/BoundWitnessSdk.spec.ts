import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { uuid } from '@xyo-network/core'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import dotenv from 'dotenv'

import { XyoArchivistBoundWitnessMongoSdk } from '../BoundWitnessSdk'
import { BoundWitnessWithPartialMeta } from '../Meta'

const schema = 'network.xyo.temp'
const address = Account.fromPhrase('test')

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
    archive,
  )
}

const getBoundWitnesses = (number = 5) => {
  return new Array(number).fill(0).map((_) => {
    return (
      new BoundWitnessBuilder({ inlinePayloads: true })
        .witness(address)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .payload(new PayloadBuilder({ schema }).fields({ prop: uuid() } as any).build())
        .build()[0]
    )
  })
}

describeIf(process.env.MONGO_CONNECTION_STRING)('XyoArchivistBoundWitnessMongoSdk', () => {
  const numBoundWitnesses = 20
  const limit = 10
  const sdk = getMongoSdk('temp')
  const boundWitnesses: BoundWitness[] = []
  beforeAll(async () => {
    const testData = getBoundWitnesses(numBoundWitnesses)
    for (let i = 0; i < testData.length; i++) {
      await sdk.insert(testData[i])
      const read = await sdk.findByHash(BoundWitnessWrapper.hash(testData[i]))
      const payload = assertEx(read.pop())
      boundWitnesses.push(payload)
      await delay(2)
    }
  })
  describe('findAfter', () => {
    let boundWitness: BoundWitnessWithPartialMeta
    let hash: string
    let timestamp: number
    beforeAll(() => {
      boundWitness = boundWitnesses[0]
      hash = BoundWitnessWrapper.hash(boundWitness)
      timestamp = assertEx(boundWitness._timestamp)
    })
    it('finds all records after the specified timestamp', async () => {
      const actual = await sdk.findAfter(timestamp, limit)
      expect(actual.length).toBe(limit)
      expect(actual).toBeSortedBy('_timestamp', { descending: false })
      const hashes = actual?.map?.((bw) => bw._hash)
      expect(hashes).not.toContain(hash)
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
    let boundWitness: BoundWitnessWithPartialMeta
    let hash: string
    let timestamp: number
    beforeAll(() => {
      boundWitness = boundWitnesses[boundWitnesses.length - 1]
      hash = BoundWitnessWrapper.hash(boundWitness)
      timestamp = assertEx(boundWitness._timestamp)
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
    let boundWitness: BoundWitnessWithPartialMeta
    let hash: string
    let timestamp: number
    beforeAll(() => {
      boundWitness = boundWitnesses[Math.floor(Math.random() * boundWitnesses.length)]
      hash = BoundWitnessWrapper.hash(boundWitness)
      timestamp = assertEx(boundWitness._timestamp)
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
