import { Account } from '@xyo-network/account'
import {
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  SetArchivePermissionsPayload,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../../collections'
import { getBaseMongoSdk } from '../../../Mongo'
import { MongoDBArchivePermissionsPayloadPayloadArchivist } from '../MongoDBArchivePermissionsPayloadArchivist'

PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))

describe('MongoDBArchivePermissionsPayloadPayloadArchivist', () => {
  const phrase = 'test'
  const account = new Account({ phrase })
  let archive = ''
  let sut: MongoDBArchivePermissionsPayloadPayloadArchivist
  describe('get', () => {
    describe('with public archive', () => {
      beforeAll(async () => {
        archive = 'temp'
        const payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>> = getBaseMongoSdk<
          XyoPayloadWithMeta<SetArchivePermissionsPayload>
        >(COLLECTIONS.Payloads)
        const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
        const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
        const params = { account, boundWitnesses, config, payloads }
        sut = await MongoDBArchivePermissionsPayloadPayloadArchivist.create(params)
      })
      it('returns no permissions for the archive', async () => {
        const result = await sut.get([archive])
        expect(result).toBeArray()
        expect(result.length).toBe(0)
      })
      it('uses an index to perform the BoundWitness query', async () => {
        const plan = await sut._findWitnessPlan(archive)
        expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
        expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(1)
        expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(1)
        expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(1)
      })
    })
    describe('with private archive', () => {
      beforeAll(async () => {
        archive = 'temp-private'
        const payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>> = getBaseMongoSdk<
          XyoPayloadWithMeta<SetArchivePermissionsPayload>
        >(COLLECTIONS.Payloads)
        const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
        const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
        const params = { account, boundWitnesses, config, payloads }
        sut = await MongoDBArchivePermissionsPayloadPayloadArchivist.create(params)
      })
      it('returns permissions for the archive', async () => {
        const result = await sut.get([archive])
        expect(result).toBeArray()
        expect(result.length).toBe(1)
        const permissions = result?.[0]
        expect(permissions).toBeObject()
      })
      it('uses an index to perform the BoundWitness query', async () => {
        const plan = await sut._findWitnessPlan(archive)
        expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
        expect(plan?.executionStats?.nReturned).toBeLessThanOrEqual(1)
        expect(plan?.executionStats?.totalDocsExamined).toBeLessThanOrEqual(1)
        expect(plan?.executionStats?.totalKeysExamined).toBeLessThanOrEqual(1)
      })
    })
  })
})
