import { AbstractModuleConfig, AbstractModuleQuery, AddressString, SchemaString } from '@xyo-network/module-model'

import { QueryBoundWitnessWrapper } from '../Query'
import { Queryable, QueryValidator } from './QueryValidator'

export type SortedPipedAddressesString = string

export class ModuleConfigQueryValidator<TConfig extends AbstractModuleConfig = AbstractModuleConfig> implements QueryValidator {
  protected _allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
  protected _disallowedAddresses: Record<SchemaString, AddressString[]> = {}
  constructor(config?: TConfig) {
    if (config?.security?.allowed) {
      Object.entries(config.security?.allowed).forEach(([schema, addressesList]) => {
        this._allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
      })
    }
    this._disallowedAddresses = config?.security?.disallowed || {}
  }

  public get allowedAddressSets(): Record<SchemaString, SortedPipedAddressesString[]> {
    return this._allowedAddressSets
  }

  queryable: Queryable = (query, payloads) => {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<AbstractModuleQuery>(query, payloads)
    const schema = wrapper.query.schema
    const addresses = query.addresses
    return addresses ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true : true
  }
  protected queryAllowed = (schema: SchemaString, addresses: SortedPipedAddressesString[]) => {
    return this._allowedAddressSets?.[schema]?.includes(addresses.sort().join('|'))
  }
  protected queryDisallowed = (schema: SchemaString, addresses: string[]) => {
    return addresses.reduce((previousValue, address) => previousValue || this._disallowedAddresses?.[schema]?.includes(address), false)
  }
}
