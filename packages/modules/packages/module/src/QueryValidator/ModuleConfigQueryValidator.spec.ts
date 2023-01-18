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

import { QueryBoundWitnessBuilder } from '../Query'
import { ModuleConfigQueryValidator } from './ModuleConfigQueryValidator'

const schema = AbstractModuleDiscoverQuerySchema

describe('ModuleConfigQueryValidator', () => {
  const allowed1 = Account.random()
  const allowed2 = Account.random()
  const allowedCosigner1 = Account.random()
  const allowedCosigner2 = Account.random()
  const disallowed1 = Account.random()
  const disallowed2 = Account.random()
  const other = Account.random()
  const allowed: Record<SchemaString, (AddressString | CosigningAddressSet)[]> = {}
  allowed[AbstractModuleDiscoverQuerySchema] = [
    allowed1.addressValue.hex,
    allowed2.addressValue.hex,
    [allowedCosigner1.addressValue.hex, allowedCosigner2.addressValue.hex],
  ]
  const disallowed: Record<SchemaString, AddressString[]> = {}
  disallowed[AbstractModuleDiscoverQuerySchema] = [disallowed1.addressValue.hex, disallowed2.addressValue.hex]
  const config: AbstractModuleConfig = { schema: AbstractModuleConfigSchema, security: { allowed } }
  const sut = new ModuleConfigQueryValidator(config)
  const queryPayload = new XyoPayloadBuilder({ schema }).build()
  describe('queryable', () => {
    describe('allowed', () => {
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
      it('allows schema from non-disallowed address', () => {
        // TODO
      })
      it('allows schema from non-disallowed addresses', () => {
        // TODO
      })
      it('disallows schema from disallowed address', () => {
        // TODO
      })
      it('disallows schema from disallowed addresses', () => {
        // TODO
      })
    })
    describe('allowed & disallowed', () => {
      it('disallowed takes precedence', () => {
        // TODO
      })
    })
  })
})
