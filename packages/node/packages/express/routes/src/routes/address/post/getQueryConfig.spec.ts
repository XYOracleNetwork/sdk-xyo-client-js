import { Account } from '@xyo-network/account'
import {
  AbstractModule,
  AbstractModuleConfig,
  AbstractModuleConfigSchema,
  AbstractModuleDiscoverQuerySchema,
  QueryBoundWitnessBuilder,
} from '@xyo-network/module'
import { AbstractArchivist } from '@xyo-network/modules'
import { ArchiveModuleConfig, ArchiveModuleConfigSchema } from '@xyo-network/node-core-model'
import { Request } from 'express'
import { mock } from 'jest-mock-extended'

import { getQueryConfig } from './getQueryConfig'

let canAccess = true
jest.mock('@xyo-network/express-node-lib', () => ({
  requestCanAccessArchive: jest.fn(() => Promise.resolve(canAccess)),
}))
const req = mock<Request>()
const testAccount1 = new Account({ phrase: 'testPhrase1' })
const testAccount2 = new Account({ phrase: 'testPhrase2' })

describe('getQueryConfig', () => {
  describe('with module', () => {
    const mod = mock<AbstractModule>()
    const config: AbstractModuleConfig = { schema: AbstractModuleConfigSchema }
    mod.config = config
    it('returns undefined', async () => {
      const query = new QueryBoundWitnessBuilder().query({ schema: AbstractModuleDiscoverQuerySchema }).build()
      const config = await getQueryConfig(mod, req, query[0], query[1])
      expect(config).toBeUndefined()
    })
  })
  describe('with archivist', () => {
    const archive = 'temp'
    const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
    const queries = () => [AbstractModuleDiscoverQuerySchema]
    const mod = mock<AbstractArchivist>({
      config,
      queries,
    })
    describe('when request can access archive', () => {
      beforeAll(() => {
        canAccess = true
      })
      it('generates config for single-signer requests', async () => {
        const query = new QueryBoundWitnessBuilder().query({ schema: AbstractModuleDiscoverQuerySchema }).witness(testAccount1).build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for multi-signer requests', async () => {
        const query = new QueryBoundWitnessBuilder()
          .query({ schema: AbstractModuleDiscoverQuerySchema })
          .witness(testAccount1)
          .witness(testAccount2)
          .build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for unsigned requests', async () => {
        const query = new QueryBoundWitnessBuilder().query({ schema: AbstractModuleDiscoverQuerySchema }).build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
    })
    describe('when request cannot access archive', () => {
      beforeAll(() => {
        canAccess = false
      })
      it('returns undefined', async () => {
        const query = new QueryBoundWitnessBuilder().query({ schema: AbstractModuleDiscoverQuerySchema }).witness(testAccount1).build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toBeUndefined()
      })
    })
  })
})
