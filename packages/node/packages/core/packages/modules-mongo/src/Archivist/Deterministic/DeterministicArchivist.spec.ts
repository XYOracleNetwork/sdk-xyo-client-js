import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
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
  let account: Account
  let archivist: ArchivistWrapper
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
    const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = new BaseMongoSdk(boundWitnessesConfig)
    const payloads: BaseMongoSdk<XyoPayloadWithMeta> = new BaseMongoSdk(payloadsConfig)
    const module = await MongoDBDeterministicArchivist.create({ boundWitnesses, config: { schema: AbstractModuleConfigSchema }, payloads })
    archivist = new ArchivistWrapper(module, account)
    account = Account.random()
  })
  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.discover()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    describe('with single payload', () => {
      const payload = PayloadWrapper.parse({ schema: 'network.xyo.payload' })
      const wrappedPayloads = [payload]
      const payloads = wrappedPayloads.map((w) => w.payload)
      it('inserts payload', async () => {
        const results = await archivist.insert(payloads)
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(2)
        const [boundResult, transactionResult] = results
        expect(boundResult.addresses).toContain(archivist.address)
        expect(transactionResult.addresses).toContain(archivist.address)
        wrappedPayloads.forEach((p) => {
          expect(transactionResult.payload_hashes).toInclude(p.hash)
        })
      })
    })
    describe('with multiple payloads', () => {
      const payload1 = PayloadWrapper.parse({ schema: 'network.xyo.debug' })
      const payload2 = PayloadWrapper.parse({ schema: 'network.xyo.test' })
      const wrappedPayloads = [payload1, payload2]
      const payloads = wrappedPayloads.map((w) => w.payload)
      it('inserts payloads', async () => {
        const results = await archivist.insert(payloads)
        expect(results).toBeTruthy()
        expect(results).toBeArrayOfSize(2)
        const [boundResult, transactionResult] = results
        expect(boundResult.addresses).toContain(archivist.address)
        expect(transactionResult.addresses).toContain(archivist.address)
        wrappedPayloads.forEach((p) => {
          expect(transactionResult.payload_hashes).toInclude(p.hash)
        })
      })
    })
  })
})
