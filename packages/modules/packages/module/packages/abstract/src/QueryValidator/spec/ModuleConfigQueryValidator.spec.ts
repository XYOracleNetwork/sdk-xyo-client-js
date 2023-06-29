import { Account } from '@xyo-network/account'
import {
  AddressString,
  CosigningAddressSet,
  ModuleConfig,
  ModuleConfigSchema,
  ModuleDiscoverQuerySchema,
  SchemaString,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { QueryBoundWitnessBuilder } from '../../Query'
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
  const allowed: Record<SchemaString, (AddressString | CosigningAddressSet)[]> = {}
  allowed[ModuleDiscoverQuerySchema] = [allowed1.address.toUpperCase(), allowed2.address, [allowedCosigner1.address, allowedCosigner2.address]]
  const disallowed: Record<SchemaString, AddressString[]> = {}
  disallowed[ModuleDiscoverQuerySchema] = [disallowed1.address.toUpperCase(), disallowed2.address]
  describe('queryable', () => {
    describe('allowed', () => {
      const config: ModuleConfig = { schema: ModuleConfigSchema, security: { allowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('allows schema from allowed address', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).witness(allowed2).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses set', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowedCosigner1).witness(allowedCosigner2).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from non-allowed address', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(other).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from non-allowed addresses', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).witness(other).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from no address', async () => {
        const query = await new QueryBoundWitnessBuilder().query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows non-allowed schema from allowed address', async () => {
        const queryPayload = new PayloadBuilder({ schema: 'foo.bar.baz' }).build()
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('disallowed', () => {
      const config: ModuleConfig = { schema: ModuleConfigSchema, security: { disallowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('allows schema from non-disallowed address', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from non-disallowed addresses', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).witness(allowed2).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from disallowed address', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(disallowed1).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from disallowed addresses', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(disallowed1).witness(disallowed2).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from allowed & disallowed addresses', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).witness(disallowed1).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('allowed & disallowed', () => {
      const config: ModuleConfig = { schema: ModuleConfigSchema, security: { allowed, disallowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('disallowed takes precedence', async () => {
        const query = await new QueryBoundWitnessBuilder().witness(allowed1).witness(disallowed1).query(queryPayload).build()
        expect(await sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
  })
})
