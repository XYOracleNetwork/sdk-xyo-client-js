import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AbstractArchivist } from '@xyo-network/archivist'
import { BoundWitnessBuilder, QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { AbstractModule } from '@xyo-network/module-abstract'
import { ModuleConfig, ModuleConfigSchema, ModuleDiscoverQuerySchema } from '@xyo-network/module-model'
import { ArchiveModuleConfig, ArchiveModuleConfigSchema } from '@xyo-network/node-core-model'
import { Request } from 'express'
import { mock } from 'jest-mock-extended'

import { getQueryConfig } from '../getQueryConfig'

const req = mock<Request>()

describe('getQueryConfig', () => {
  describe('with module', () => {
    const config: ModuleConfig = { schema: ModuleConfigSchema }
    const queries = [ModuleDiscoverQuerySchema]
    const mod = mock<AbstractModule>({
      config,
      queries,
    })
    let testAccount1: AccountInstance
    beforeAll(async () => {
      testAccount1 = await Account.create({ phrase: 'testPhrase1' })
    })
    it('generates query config for current query', async () => {
      const query = await new QueryBoundWitnessBuilder().query({ schema: ModuleDiscoverQuerySchema }).witness(testAccount1).build()
      const config = await getQueryConfig(mod, req, query[0], query[1])
      expect(config?.security?.allowed).toContainKey(ModuleDiscoverQuerySchema)
      expect(config?.security?.allowed?.[ModuleDiscoverQuerySchema]).toBeArrayOfSize(1)
      expect(config?.security?.allowed?.[ModuleDiscoverQuerySchema][0]).toEqual([testAccount1.address])
      expect(config).toMatchSnapshot()
    })
  })
  describe('with archivist', () => {
    const archive = 'temp'
    const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
    const queries = [ModuleDiscoverQuerySchema]
    const mod = mock<AbstractArchivist>({
      config,
      queries,
    })
    describe('when request can access archive', () => {
      let testAccount1: AccountInstance
      let testAccount2: AccountInstance
      let testAccount3: AccountInstance
      let testAccount4: AccountInstance
      beforeAll(async () => {
        testAccount1 = await Account.create({ phrase: 'testPhrase1' })
        testAccount2 = await Account.create({ phrase: 'testPhrase2' })
        testAccount3 = await Account.create({ phrase: 'testPhrase3' })
        testAccount4 = await Account.create({ phrase: 'testPhrase4' })
        // canAccess = true
      })
      it('generates config for single-signer requests', async () => {
        const query = await new QueryBoundWitnessBuilder().query({ schema: ModuleDiscoverQuerySchema }).witness(testAccount1).build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for multi-signer requests', async () => {
        const query = await new QueryBoundWitnessBuilder()
          .query({ schema: ModuleDiscoverQuerySchema })
          .witness(testAccount1)
          .witness(testAccount2)
          .build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for nested-signed requests', async () => {
        const bw = await new BoundWitnessBuilder().witness(testAccount3).witness(testAccount4).build()
        const query = await new QueryBoundWitnessBuilder()
          .query({ schema: ModuleDiscoverQuerySchema })
          .witness(testAccount1)
          .witness(testAccount2)
          .payload(bw[0])
          .build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for nested-signed multi-signer requests', async () => {
        const bw1 = await new BoundWitnessBuilder().witness(testAccount3).build()
        const bw2 = await new BoundWitnessBuilder().witness(testAccount4).build()
        const query = await new QueryBoundWitnessBuilder()
          .query({ schema: ModuleDiscoverQuerySchema })
          .witness(testAccount1)
          .witness(testAccount2)
          .payload(bw1[0])
          .payload(bw2[0])
          .build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
      it('generates config for unsigned requests', async () => {
        const query = await new QueryBoundWitnessBuilder().query({ schema: ModuleDiscoverQuerySchema }).build()
        const config = await getQueryConfig(mod, req, query[0], query[1])
        expect(config).toMatchSnapshot()
      })
    })
  })
})
