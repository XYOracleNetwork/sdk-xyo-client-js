import { Account } from '@xyo-network/account'
import {
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  SetArchivePermissionsPayload,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBArchivePermissionsPayloadPayloadArchivist } from './MongoDBArchivePermissionsPayloadArchivist'

describe('MongoDBArchivePermissionsPayloadPayloadArchivist', () => {
  const phrase = process.env.ACCOUNT_SEED
  const account = new Account({ phrase })
  let archive = ''
  let sut: MongoDBArchivePermissionsPayloadPayloadArchivist
  describe('get', () => {
    describe('with public archive', () => {
      beforeAll(() => {
        archive = 'temp'
        const payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>> = getBaseMongoSdk<
          XyoPayloadWithMeta<SetArchivePermissionsPayload>
        >(COLLECTIONS.Payloads)
        const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
        const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
        sut = new MongoDBArchivePermissionsPayloadPayloadArchivist(account, payloads, boundWitnesses, config)
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
      beforeAll(() => {
        archive = 'temp-private'
        const payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>> = getBaseMongoSdk<
          XyoPayloadWithMeta<SetArchivePermissionsPayload>
        >(COLLECTIONS.Payloads)
        const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
        const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
        sut = new MongoDBArchivePermissionsPayloadPayloadArchivist(account, payloads, boundWitnesses, config)
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
