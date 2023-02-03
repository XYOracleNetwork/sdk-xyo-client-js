/* eslint-disable max-statements */
let timestamp = 123456789000
Date.now = jest.fn(() => timestamp)

import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleConfigSchema } from '@xyo-network/module-model'
import { XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { COLLECTIONS } from '../../collections'
import { MongoDBDeterministicArchivist } from './DeterministicArchivist'

describe('DeterministicArchivist', () => {
  const boundWitnessesConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.BoundWitnesses }
  const payloadsConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.Payloads }
  const server = new MongoMemoryServer()
  const archiveAccount: Account = new Account({ phrase: 'temp' })
  // 0x10cal
  const userAccount: Account = new Account({ privateKey: '69f0b123c094c34191f22c25426036d6e46d5e1fab0a04a164b3c1c2621152ab' })
  // 0xdadda
  const moduleAccount: Account = new Account({ phrase: '9c9637dc07ce9956190c028677f5195a8fb425e9927bf2e48fe39a1c55cf050a' })
  // 0xace
  const randomAccount: Account = new Account({ phrase: '3c17e038c8daeed7dfab9b9653321523d5f1a68eadfc5e4bd501075a5e43bbcc' })
  const payload1 = { nonce: 1, schema: 'network.xyo.debug' }
  const payload2 = { nonce: 2, schema: 'network.xyo.test' }
  const payload3 = { nonce: 3, schema: 'network.xyo.debug' }
  const payload4 = { nonce: 4, schema: 'network.xyo.test' }
  const payloadWrapper1 = PayloadWrapper.parse(payload1)
  const payloadWrapper2 = PayloadWrapper.parse(payload2)
  const payloadWrapper3 = PayloadWrapper.parse(payload3)
  const payloadWrapper4 = PayloadWrapper.parse(payload4)
  const boundWitness1 = new BoundWitnessBuilder().payload(payloadWrapper1.payload).witness(archiveAccount).build()[0]
  const boundWitness2 = new BoundWitnessBuilder().payload(payloadWrapper2.payload).witness(archiveAccount).build()[0]
  const boundWitness3 = new BoundWitnessBuilder().payloads([payloadWrapper3.payload, payloadWrapper4.payload]).witness(archiveAccount).build()[0]
  const boundWitnessWrapper1 = BoundWitnessWrapper.parse(boundWitness1)
  boundWitnessWrapper1.payloads = [payload1]
  const boundWitnessWrapper2 = BoundWitnessWrapper.parse(boundWitness2)
  boundWitnessWrapper2.payloads = [payload2]
  const boundWitnessWrapper3 = BoundWitnessWrapper.parse(boundWitness3)
  boundWitnessWrapper3.payloads = [payload3, payload4]

  let archivist: ArchivistWrapper
  let insertResult1: XyoBoundWitness[]
  let insertResult2: XyoBoundWitness[]
  let insertResult3: XyoBoundWitness[]
  const insertResults: XyoBoundWitness[][] = []
  beforeAll(async () => {
    jest.spyOn(Account, 'random').mockImplementation(() => randomAccount)
    await server.start()
    const uri = server.getUri()
    boundWitnessesConfig.dbConnectionString = uri
    payloadsConfig.dbConnectionString = uri
    const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = new BaseMongoSdk(boundWitnessesConfig)
    const payloads: BaseMongoSdk<XyoPayloadWithMeta> = new BaseMongoSdk(payloadsConfig)
    const module = await MongoDBDeterministicArchivist.create({
      account: moduleAccount,
      boundWitnesses,
      config: { schema: AbstractModuleConfigSchema },
      payloads,
    })
    archivist = new ArchivistWrapper(module, archiveAccount)
    const insertions = [
      [boundWitness1, payload1],
      [boundWitness2, payload2],
      [boundWitness3, payload3, payload4],
    ]
    for (const insertion of insertions) {
      const insertionResult = await archivist.insert(insertion)
      insertResults.push(insertionResult)
      // NOTE: Increment Date.now after each insert so that DB sorting by time works
      timestamp++
    }
    insertResult1 = insertResults[0]
    insertResult2 = insertResults[1]
    insertResult3 = insertResults[2]
  })
  afterAll(async () => {
    await server.stop()
  })
  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.discover()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    it('inserts single payload', () => {
      expect(insertResult1).toBeTruthy()
      expect(insertResult1).toBeArrayOfSize(2)
      const [boundResult, transactionResults] = insertResult1
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(archiveAccount.public.address.hex)
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitnessWrapper1.payloadsArray.length)
      boundWitnessWrapper1.payloadsArray.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
      expect(insertResult1.map((bw) => BoundWitnessWrapper.parse(bw).body)).toMatchSnapshot()
    })
    it('inserts multiple payloads', () => {
      expect(insertResult3).toBeTruthy()
      expect(insertResult3).toBeArrayOfSize(2)
      const [boundResult, transactionResults] = insertResult3
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(archiveAccount.public.address.hex)
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitnessWrapper3.payloadsArray.length)
      boundWitnessWrapper3.payloadsArray.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
      expect(insertResult3.map((bw) => BoundWitnessWrapper.parse(bw).body)).toMatchSnapshot()
    })
  })
  describe('get', () => {
    it.each([
      ['gets single payload', [payloadWrapper1]],
      ['gets multiple payloads', [payloadWrapper1, payloadWrapper2, payloadWrapper3]],
      ['gets single boundwitness', [boundWitnessWrapper1]],
      ['gets multiple boundwitness', [boundWitnessWrapper1, boundWitnessWrapper2, boundWitnessWrapper3]],
    ])('%s', async (_title, payloads) => {
      const results = await archivist.get(payloads.map((p) => p.hash))
      expect(results).toBeTruthy()
      expect(results).toBeArrayOfSize(payloads.length)
      const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
      const resultHashes = resultPayloads.map((p) => p.hash)
      payloads.map((p) => {
        expect(resultHashes).toInclude(p.hash)
      })
      expect(results).toMatchSnapshot()
    })
  })
  describe('find', () => {
    describe('with schema for BoundWitness', () => {
      const schema = XyoBoundWitnessSchema
      it.each([
        ['finds single boundwitness', [boundWitnessWrapper1]],
        ['finds multiple boundwitness', [boundWitnessWrapper1, boundWitnessWrapper2, boundWitnessWrapper3]],
      ])('%s', async (_title, boundWitnesses) => {
        const offset = boundWitnesses.at(-1)?.hash
        const limit = boundWitnesses.length
        const results = await archivist.find({ limit, offset, schema })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(boundWitnesses.length)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        const resultHashes = resultPayloads.map((p) => p.hash)
        boundWitnesses.map((p) => {
          expect(resultHashes).toInclude(p.hash)
        })
        expect(results).toMatchSnapshot()
      })
    })
    describe('with schema for Payload', () => {
      const schema = 'network.xyo.debug'
      it.each([
        ['finds single payload', [payloadWrapper1]],
        ['finds multiple payloads', [payloadWrapper1, payloadWrapper3]],
      ])('%s', async (_title, payloads) => {
        const limit = payloads.length
        const results = await archivist.find({ limit, schema })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(payloads.length)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        resultPayloads.map((p) => {
          expect(p.schema).toBe(schema)
        })
        expect(results).toMatchSnapshot()
      })
    })
    describe('with no schema', () => {
      it('finds address history', async () => {
        const history = [
          boundWitnessWrapper3,
          payloadWrapper3,
          payloadWrapper4,
          boundWitnessWrapper2,
          payloadWrapper2,
          boundWitnessWrapper1,
          payloadWrapper1,
        ]
        const limit = history.length
        const results = await archivist.find({ limit })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(limit)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        const resultHashes = resultPayloads.map((p) => p.hash)
        history.map((p) => {
          expect(resultHashes).toInclude(p.hash)
        })
        expect(results).toMatchSnapshot()
      })
    })
  })
})
