import { ArchivistWrapper } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModuleConfigSchema } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
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
  let archivist: ArchivistWrapper
  describe('insert', () => {
    it('inserts payload', async () => {
      const result = await archivist.discover()
      expect(result).toBeTruthy()
    })
  })
})
