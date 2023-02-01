Date.now = jest.fn(() => 123456789000)

import { assertEx } from '@xylabs/assert'
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
  // 0xace
  const moduleAccount: Account = new Account({ phrase: '3c17e038c8daeed7dfab9b9653321523d5f1a68eadfc5e4bd501075a5e43bbcc' })
  const randomAccount: Account = new Account({ phrase: 'test3' })
  const payload1 = PayloadWrapper.parse({ nonce: 1, schema: 'network.xyo.debug' })
  const payload2 = PayloadWrapper.parse({ nonce: 2, schema: 'network.xyo.test' })
  const payload3 = PayloadWrapper.parse({ nonce: 3, schema: 'network.xyo.debug' })
  const payload4 = PayloadWrapper.parse({ nonce: 4, schema: 'network.xyo.test' })
  const boundWitness1 = BoundWitnessWrapper.parse(new BoundWitnessBuilder().payload(payload1.payload).witness(userAccount).build()[0])
  boundWitness1.payloads = [payload1.payload]
  const boundWitness2 = BoundWitnessWrapper.parse(new BoundWitnessBuilder().payload(payload2.payload).witness(userAccount).build()[0])
  boundWitness2.payloads = [payload2.payload]
  const boundWitness3 = BoundWitnessWrapper.parse(
    new BoundWitnessBuilder().payloads([payload3.payload, payload4.payload]).witness(userAccount).build()[0],
  )
  boundWitness3.payloads = [payload3.payload, payload4.payload]
  let archivist: ArchivistWrapper
  let insertResult1: XyoBoundWitness[]
  let insertResult2: XyoBoundWitness[]
  let insertResult3: XyoBoundWitness[]
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
    archivist = new ArchivistWrapper(module, userAccount)
    insertResult1 = await archivist.insert([boundWitness1, payload1].map((p) => p.body))
    insertResult2 = await archivist.insert([boundWitness2, payload2].map((p) => p.body))
    insertResult3 = await archivist.insert([boundWitness3, payload3, payload4].map((p) => p.body))
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
      expect(transactionResults.addresses).toContain(userAccount.public.address.hex)
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitness1.payloadsArray.length + 2)
      boundWitness1.payloadsArray.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
      expect(insertResult1.map((bw) => BoundWitnessWrapper.parse(bw).body)).toMatchSnapshot()
    })
    it('inserts multiple payloads', () => {
      expect(insertResult3).toBeTruthy()
      expect(insertResult3).toBeArrayOfSize(2)
      const [boundResult, transactionResults] = insertResult3
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(userAccount.public.address.hex)
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitness3.payloadsArray.length + 2)
      boundWitness3.payloadsArray.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
      expect(insertResult3.map((bw) => BoundWitnessWrapper.parse(bw).body)).toMatchSnapshot()
    })
  })
  describe('get', () => {
    it.each([
      ['gets single payload', [payload1]],
      ['gets multiple payloads', [payload1, payload2]],
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
      it('finds single bw', async () => {
        const boundWitnesses = [boundWitness1, boundWitness2]
        const limit = boundWitnesses.length
        const offset = assertEx(boundWitnesses.at(-1)?.hash)
        const results = await archivist.find({ limit, offset, schema })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(limit)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        const resultHashes = resultPayloads.map((p) => p.hash)
        expect(resultHashes).toInclude(boundWitness2.hash)
        expect(results).toMatchSnapshot()
      })
      it('finds multiple bws', async () => {
        const boundWitnesses = [boundWitness1, boundWitness2, boundWitness3]
        const limit = boundWitnesses.length
        const offset = assertEx(boundWitnesses.at(-1)?.hash)
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
        ['finds single payload', [payload1]],
        ['finds multiple payloads', [payload1, payload2]],
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
        const limit = 10
        const results = await archivist.find({ limit })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(3)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        const resultHashes = resultPayloads.map((p) => p.hash)
        // payloads.map((p) => {
        //   expect(resultHashes).toInclude(p.hash)
        // })
        expect(results).toMatchSnapshot()
      })
    })
  })
})
