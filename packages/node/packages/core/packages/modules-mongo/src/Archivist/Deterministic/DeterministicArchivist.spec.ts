import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
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
  let account: Account = Account.random()
  let archivist: ArchivistWrapper
  let nonce = Date.now()
  beforeAll(async () => {
    await server.start()
    const uri = server.getUri()
    boundWitnessesConfig.dbConnectionString = uri
    payloadsConfig.dbConnectionString = uri
  })
  afterAll(async () => {
    await server.stop()
  })
  beforeEach(async () => {
    nonce = Date.now()
    const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = new BaseMongoSdk(boundWitnessesConfig)
    const payloads: BaseMongoSdk<XyoPayloadWithMeta> = new BaseMongoSdk(payloadsConfig)
    const module = await MongoDBDeterministicArchivist.create({ boundWitnesses, config: { schema: AbstractModuleConfigSchema }, payloads })
    account = Account.random()
    archivist = new ArchivistWrapper(module, account)
  })
  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.discover()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    const payload1 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.debug' })
    const payload2 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.test' })
    it.each([
      ['inserts single payload', [payload1]],
      ['inserts multiple payloads', [payload1, payload2]],
    ])('%s', async (_title, payloads) => {
      const results = await archivist.insert(payloads.map((w) => w.payload))
      expect(results).toBeTruthy()
      expect(results).toBeArrayOfSize(2)
      const [boundResult, transactionResults] = results
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(account.public.address.hex)
      expect(transactionResults.payload_hashes).toBeArrayOfSize(payloads.length + 1)
      payloads.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
    })
  })
  describe('get', () => {
    const payload1 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.debug' })
    const payload2 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.test' })
    it.each([
      ['gets single payload', [payload1]],
      ['gets multiple payloads', [payload1, payload2]],
    ])('%s', async (_title, payloads) => {
      await archivist.insert(payloads.map((w) => w.payload))
      const results = await archivist.get(payloads.map((p) => p.hash))
      expect(results).toBeTruthy()
      expect(results).toBeArrayOfSize(payloads.length)
      const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
      const resultHashes = resultPayloads.map((p) => p.hash)
      payloads.map((p) => {
        expect(resultHashes).toInclude(p.hash)
      })
    })
  })
  describe('find', () => {
    describe('with schema for BoundWitness', () => {
      const payload1 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.debug' })
      const payload2 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.test' })
      const schema = XyoBoundWitnessSchema
      it('finds single bw', async () => {
        const boundWitness1 = BoundWitnessWrapper.parse(new BoundWitnessBuilder().payload(payload1.payload).witness(account).build()[0])
        const boundWitnesses = [boundWitness1]
        await archivist.insert(boundWitnesses.map((bw) => bw.boundwitness))
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
      })
      it('finds multiple bws', async () => {
        const boundWitness1 = BoundWitnessWrapper.parse(new BoundWitnessBuilder().payload(payload1.payload).witness(account).build()[0])
        const boundWitness2 = BoundWitnessWrapper.parse(
          new BoundWitnessBuilder().payloads([payload1.payload, payload2.payload]).witness(account).build()[0],
        )
        const boundWitnesses = [boundWitness1, boundWitness2]
        await archivist.insert(boundWitnesses.map((bw) => bw.boundwitness))
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
      })
    })
    describe('with schema for Payload', () => {
      const schema = 'network.xyo.debug'
      const payload1 = PayloadWrapper.parse({ nonce, schema })
      const payload2 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.test' })
      it.each([
        ['finds single payload', [payload1]],
        ['finds multiple payloads', [payload1, payload2]],
      ])('%s', async (_title, payloads) => {
        for (let i = 0; i < payloads.length; i++) {
          const unique = payloads
            .map((w) => w.payload)
            .map((p) => {
              ;(p as unknown as { nonce: number }).nonce = Date.now()
              return p
            })
          await archivist.insert(unique)
        }
        const limit = payloads.length
        const results = await archivist.find({ limit, schema })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(payloads.length)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        resultPayloads.map((p) => {
          expect(p.schema).toBe(schema)
        })
      })
    })
    describe('with no schema', () => {
      const payload1 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.debug' })
      const payload2 = PayloadWrapper.parse({ nonce, schema: 'network.xyo.test' })
      it('finds address history', async () => {
        const payloads = [payload1, payload2]
        await Promise.all(payloads.map((payload) => archivist.insert([payload.payload])))
        const limit = payloads.length + 2
        const results = await archivist.find({ limit })
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(limit)
        const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
        const resultHashes = resultPayloads.map((p) => p.hash)
        payloads.map((p) => {
          expect(resultHashes).toInclude(p.hash)
        })
      })
    })
  })
})
