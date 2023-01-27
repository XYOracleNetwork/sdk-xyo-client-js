import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModuleConfigSchema } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { COLLECTIONS } from '../../collections'
import { MongoDBDeterministicArchivist } from './DeterministicArchivist'

describe('DeterministicArchivist', () => {
  const server = new MongoMemoryServer()
  const boundWitnessesConfig: BaseMongoSdkConfig = {
    collection: COLLECTIONS.BoundWitnesses,
  }
  const payloadsConfig: BaseMongoSdkConfig = {
    collection: COLLECTIONS.Payloads,
  }
  const config = {
    schema: AbstractModuleConfigSchema,
  }
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
    const boundWitnesses: BaseMongoSdk<XyoBoundWitness> = new BaseMongoSdk(boundWitnessesConfig)
    const payloads: BaseMongoSdk<XyoPayload> = new BaseMongoSdk(payloadsConfig)
    const sut = await MongoDBDeterministicArchivist.create({ boundWitnesses, config, payloads })
    archivist = new ArchivistWrapper(sut)
  })
  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.discover()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    it('inserts payload', async () => {
      const payload = PayloadWrapper.parse({ schema: 'network.xyo.payload' }).payload
      const account = Account.random()
      const bw = new BoundWitnessBuilder({ inlinePayloads: true }).witness(account).payload(payload).build()
      const result = await archivist.insert([bw[0], ...bw[1]])
      expect(result).toBeTruthy()
    })
  })
})
