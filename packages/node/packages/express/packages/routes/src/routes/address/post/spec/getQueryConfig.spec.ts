import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
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

import { getQueryConfig } from '../getQueryConfig'

let canAccess = true
jest.mock('@xyo-network/express-node-lib', () => ({
  requestCanAccessArchive: jest.fn(() => Promise.resolve(canAccess)),
}))
const req = mock<Request>()
const testAccount1 = new Account({ phrase: 'testPhrase1' })
const testAccount2 = new Account({ phrase: 'testPhrase2' })
const testAccount3 = new Account({ phrase: 'testPhrase3' })
const testAccount4 = new Account({ phrase: 'testPhrase4' })

describe('getQueryConfig', () => {
  describe('with module', () => {
    const config: AbstractModuleConfig = { schema: AbstractModuleConfigSchema }
    const mod = mock<AbstractModule>({ config })
    it('returns undefined', async () => {
      const query = new QueryBoundWitnessBuilder().query({ schema: AbstractModuleDiscoverQuerySchema }).build()
      const config = await getQueryConfig(mod, req, query[0], query[1])
      expect(config).toBeUndefined()
    })
  })
  describe('with archivist', () => {
    const archive = 'temp'
    const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
    const queries = [AbstractModuleDiscoverQuerySchema]
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
      it('generates config for nested-signed requests', async () => {
        const bw = new BoundWitnessBuilder().witness(testAccount3).witness(testAccount4).build()
        const query = new QueryBoundWitnessBuilder()
          .query({ schema: AbstractModuleDiscoverQuerySchema })
          .witness(testAccount1)
          .witness(testAccount2)
          .payload(bw[0])
          .build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for nested-signed multi-signer requests', async () => {
        const bw1 = new BoundWitnessBuilder().witness(testAccount3).build()
        const bw2 = new BoundWitnessBuilder().witness(testAccount4).build()
        const query = new QueryBoundWitnessBuilder()
          .query({ schema: AbstractModuleDiscoverQuerySchema })
          .witness(testAccount1)
          .witness(testAccount2)
          .payload(bw1[0])
          .payload(bw2[0])
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
