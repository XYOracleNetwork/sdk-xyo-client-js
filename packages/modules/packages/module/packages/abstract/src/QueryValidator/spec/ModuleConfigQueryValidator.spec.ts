import { Address, Hex } from '@xylabs/hex'
import { Account } from '@xyo-network/account'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { CosigningAddressSet, ModuleConfig, ModuleConfigSchema, ModuleDiscoverQuerySchema, SchemaString } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { ModuleConfigQueryValidator } from '../ModuleConfigQueryValidator'

const schema = ModuleDiscoverQuerySchema

describe('ModuleConfigQueryValidator', () => {
  const allowed1 = Account.randomSync()
  const allowed2 = Account.randomSync()
  const allowedCosigner1 = Account.randomSync()
  const allowedCosigner2 = Account.randomSync()
  const disallowed1 = Account.randomSync()
  const disallowed2 = Account.randomSync()
  const other = Account.randomSync()
  const queryPayload = new PayloadBuilder({ schema }).build()
  const allowed: Record<SchemaString, (Address | CosigningAddressSet)[]> = {}
  allowed[ModuleDiscoverQuerySchema] = [
    allowed1.address.toUpperCase(),
    allowed2.address,
    [allowedCosigner1.address, allowedCosigner2.address],
  ] as Hex[]
  const disallowed: Record<SchemaString, Address[]> = {}
  disallowed[ModuleDiscoverQuerySchema] = [disallowed1.address.toUpperCase() as Hex, disallowed2.address]
  describe('queryable', () => {
    describe('allowed', () => {
      const config: ModuleConfig = { schema: ModuleConfigSchema, security: { allowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('allows schema from allowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().witness(allowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(allowed1)
            .witness(allowed2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses set', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(allowedCosigner1)
            .witness(allowedCosigner2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from non-allowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().witness(other).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from non-allowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(allowed1)
            .witness(other)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from no address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows non-allowed schema from allowed address', async () => {
        const queryPayload = new PayloadBuilder({ schema: 'foo.bar.baz' }).build()
        const query = await (await new QueryBoundWitnessBuilder().witness(allowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('disallowed', () => {
      const config: ModuleConfig = { schema: ModuleConfigSchema, security: { disallowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('allows schema from non-disallowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().witness(allowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from non-disallowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(allowed1)
            .witness(allowed2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from disallowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().witness(disallowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from disallowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(disallowed1)
            .witness(disallowed2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from allowed & disallowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(allowed1)
            .witness(disallowed1)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('allowed & disallowed', () => {
      const config: ModuleConfig = { schema: ModuleConfigSchema, security: { allowed, disallowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('disallowed takes precedence', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .witness(allowed1)
            .witness(disallowed1)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
  })
})
