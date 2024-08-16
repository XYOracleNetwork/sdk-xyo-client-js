import type { Address, Hex } from '@xylabs/hex'
import type { AccountInstance } from '@xyo-network/account'
import { Account } from '@xyo-network/account'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { CosigningAddressSet, ModuleConfig } from '@xyo-network/module-model'
import { ModuleConfigSchema, ModuleStateQuerySchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Schema } from '@xyo-network/payload-model'

import { ModuleConfigQueryValidator } from '../ModuleConfigQueryValidator'

const schema = ModuleStateQuerySchema

describe('ModuleConfigQueryValidator', () => {
  let allowed1: AccountInstance
  let allowed2: AccountInstance
  let allowedCosigner1: AccountInstance
  let allowedCosigner2: AccountInstance
  let disallowed1: AccountInstance
  let disallowed2: AccountInstance
  let other: AccountInstance
  const queryPayload = new PayloadBuilder({ schema }).build()
  const allowed: Record<Schema, (Address | CosigningAddressSet)[]> = {}
  const disallowed: Record<Schema, Address[]> = {}
  beforeAll(async () => {
    allowed1 = await Account.random()
    allowed2 = await Account.random()
    allowedCosigner1 = await Account.random()
    allowedCosigner2 = await Account.random()
    disallowed1 = await Account.random()
    disallowed2 = await Account.random()
    other = await Account.random()

    allowed[ModuleStateQuerySchema] = [
      allowed1.address.toUpperCase(),
      allowed2.address,
      [allowedCosigner1.address, allowedCosigner2.address],
    ] as Hex[]
    disallowed[ModuleStateQuerySchema] = [disallowed1.address.toUpperCase() as Hex, disallowed2.address]
  })
  describe('queryable', () => {
    describe('allowed', () => {
      let config: ModuleConfig
      let sut: ModuleConfigQueryValidator<ModuleConfig>
      beforeAll(() => {
        config = { schema: ModuleConfigSchema, security: { allowed } }
        sut = new ModuleConfigQueryValidator(config)
      })
      it('allows schema from allowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().signer(allowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(allowed1)
            .signer(allowed2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses set', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(allowedCosigner1)
            .signer(allowedCosigner2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from non-allowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().signer(other).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from non-allowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(allowed1)
            .signer(other)
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
        const query = await (await new QueryBoundWitnessBuilder().signer(allowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('disallowed', () => {
      let config: ModuleConfig
      let sut: ModuleConfigQueryValidator<ModuleConfig>
      beforeAll(() => {
        config = { schema: ModuleConfigSchema, security: { disallowed } }
        sut = new ModuleConfigQueryValidator(config)
      })
      it('allows schema from non-disallowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().signer(allowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from non-disallowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(allowed1)
            .signer(allowed2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from disallowed address', async () => {
        const query = await (await new QueryBoundWitnessBuilder().signer(disallowed1).query(await queryPayload)).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from disallowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(disallowed1)
            .signer(disallowed2)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from allowed & disallowed addresses', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(allowed1)
            .signer(disallowed1)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('allowed & disallowed', () => {
      let config: ModuleConfig
      let sut: ModuleConfigQueryValidator<ModuleConfig>
      beforeAll(() => {
        config = { schema: ModuleConfigSchema, security: { allowed, disallowed } }
        sut = new ModuleConfigQueryValidator(config)
      })
      it('disallowed takes precedence', async () => {
        const query = await (
          await new QueryBoundWitnessBuilder()
            .signer(allowed1)
            .signer(disallowed1)
            .query(await queryPayload)
        ).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
  })
})
