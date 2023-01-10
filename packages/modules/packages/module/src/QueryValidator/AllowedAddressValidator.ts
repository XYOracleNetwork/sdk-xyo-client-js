import { AddressString, SchemaString } from '@xyo-network/module-model'

import { AbstractModule } from '../AbstractModule'
import { Queryable, QueryValidator } from './QueryValidator'

type SortedPipedAddressesString = string

export class AllowedAddressValidator implements QueryValidator {
  protected allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
  protected disallowedAddresses: Record<SchemaString, AddressString[]> = {}
  constructor(mod: AbstractModule) {
    if (mod.config.security?.allowed) {
      Object.entries(mod.config.security?.allowed).forEach(([schema, addressesList]) => {
        this.allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
      })
    }
    this.disallowedAddresses = mod.config.security?.disallowed || {}
  }
  queryable: Queryable = (query, _mod) => {
    const schema = query.query.schema
    const addresses = query.addresses
    return addresses ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true : true
  }
  protected queryAllowed = (schema: SchemaString, addresses: SortedPipedAddressesString[]) => {
    return this.allowedAddressSets?.[schema]?.includes(addresses.sort().join('|'))
  }
  protected queryDisallowed = (schema: SchemaString, addresses: string[]) => {
    return addresses.reduce((previousValue, address) => previousValue || this.disallowedAddresses?.[schema]?.includes(address), false)
  }
}
