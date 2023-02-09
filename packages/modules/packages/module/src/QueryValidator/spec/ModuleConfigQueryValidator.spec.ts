import { Account } from '@xyo-network/account'
import {
  AbstractModuleConfig,
  AbstractModuleConfigSchema,
  AbstractModuleDiscoverQuerySchema,
  AddressString,
  CosigningAddressSet,
  SchemaString,
} from '@xyo-network/module-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'

import { QueryBoundWitnessBuilder } from '../../Query'
import { ModuleConfigQueryValidator } from '../ModuleConfigQueryValidator'

const schema = AbstractModuleDiscoverQuerySchema

describe('ModuleConfigQueryValidator', () => {
  const allowed1 = Account.random()
  const allowed2 = Account.random()
  const allowedCosigner1 = Account.random()
  const allowedCosigner2 = Account.random()
  const disallowed1 = Account.random()
  const disallowed2 = Account.random()
  const other = Account.random()
  const queryPayload = new XyoPayloadBuilder({ schema }).build()
  const allowed: Record<SchemaString, (AddressString | CosigningAddressSet)[]> = {}
  allowed[AbstractModuleDiscoverQuerySchema] = [
    allowed1.addressValue.hex.toUpperCase(),
    allowed2.addressValue.hex,
    [allowedCosigner1.addressValue.hex, allowedCosigner2.addressValue.hex],
  ]
  const disallowed: Record<SchemaString, AddressString[]> = {}
  disallowed[AbstractModuleDiscoverQuerySchema] = [disallowed1.addressValue.hex.toUpperCase(), disallowed2.addressValue.hex]
  describe('queryable', () => {
    describe('allowed', () => {
      const config: AbstractModuleConfig = { schema: AbstractModuleConfigSchema, security: { allowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('allows schema from allowed address', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).witness(allowed2).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from allowed addresses set', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowedCosigner1).witness(allowedCosigner2).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from non-allowed address', () => {
        const query = new QueryBoundWitnessBuilder().witness(other).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from non-allowed addresses', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).witness(other).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from no address', () => {
        const query = new QueryBoundWitnessBuilder().query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows non-allowed schema from allowed address', () => {
        const queryPayload = new XyoPayloadBuilder({ schema: 'foo.bar.baz' }).build()
        const query = new QueryBoundWitnessBuilder().witness(allowed1).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('disallowed', () => {
      const config: AbstractModuleConfig = { schema: AbstractModuleConfigSchema, security: { disallowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('allows schema from non-disallowed address', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('allows schema from non-disallowed addresses', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).witness(allowed2).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeTrue()
      })
      it('disallows schema from disallowed address', () => {
        const query = new QueryBoundWitnessBuilder().witness(disallowed1).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from disallowed addresses', () => {
        const query = new QueryBoundWitnessBuilder().witness(disallowed1).witness(disallowed2).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
      it('disallows schema from allowed & disallowed addresses', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).witness(disallowed1).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
    describe('allowed & disallowed', () => {
      const config: AbstractModuleConfig = { schema: AbstractModuleConfigSchema, security: { allowed, disallowed } }
      const sut = new ModuleConfigQueryValidator(config)
      it('disallowed takes precedence', () => {
        const query = new QueryBoundWitnessBuilder().witness(allowed1).witness(disallowed1).query(queryPayload).build()
        expect(sut.queryable(query[0], query[1])).toBeFalse()
      })
    })
  })
})
