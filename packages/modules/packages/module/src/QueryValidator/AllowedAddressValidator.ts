import { AddressString, SchemaString } from '@xyo-network/module-model'

import { AbstractModule } from '../AbstractModule'
import { Queryable, QueryValidator } from './QueryValidator'

type SortedPipedAddressesString = string

export class AllowedAddressValidator implements QueryValidator {
  protected _allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
  protected _disallowedAddresses: Record<SchemaString, AddressString[]> = {}
  constructor(mod: AbstractModule) {
    if (mod.config.security?.allowed) {
      Object.entries(mod.config.security?.allowed).forEach(([schema, addressesList]) => {
        this._allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
      })
    }
    this._disallowedAddresses = mod.config.security?.disallowed || {}
  }

  public get allowedAddressSets(): Record<SchemaString, SortedPipedAddressesString[]> {
    return this._allowedAddressSets
  }

  queryable: Queryable = (query, _mod) => {
    const schema = query.query.schema
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
