import { AbstractModuleConfig, AbstractModuleQuery, AddressString, CosigningAddressSet, SchemaString } from '@xyo-network/module-model'

import { QueryBoundWitnessWrapper } from '../Query'
import { Queryable, QueryValidator } from './QueryValidator'

export type SortedPipedAddressesString = string

export class ModuleConfigQueryValidator<TConfig extends AbstractModuleConfig = AbstractModuleConfig> implements QueryValidator {
  protected _allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
  protected _disallowedAddresses: Record<SchemaString, AddressString[]> = {}
  constructor(config?: TConfig) {
    if (config?.security?.allowed) {
      Object.entries(config.security?.allowed).forEach(([schema, addressesList]) => {
        this._allowedAddressSets[schema] = addressesList.map(toAddressesString)
      })
    }
    this._disallowedAddresses = config?.security?.disallowed || {}
  }

  queryable: Queryable = (query, payloads) => {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<AbstractModuleQuery>(query, payloads)
    const schema = wrapper.query.schema
    const addresses = query.addresses
    return addresses ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true : true
  }
  protected queryAllowed = (schema: SchemaString, addresses: string[]) => {
    // All cosigners must sign
    if (addresses.length > 1) {
      const signatories = toAddressesString(addresses)
      const validCosigners = this._allowedAddressSets?.[schema]?.includes(signatories)
      if (validCosigners) return true
    }
    // OR all signers have to be allowed individually
    return addresses.every((address) => this._allowedAddressSets?.[schema]?.includes(address))
  }
  protected queryDisallowed = (schema: SchemaString, addresses: string[]) => {
    return addresses.reduce((previousValue, address) => previousValue || this._disallowedAddresses?.[schema]?.includes(address), false)
  }
}

const toAddressesString = (addresses: string | CosigningAddressSet): SortedPipedAddressesString => {
  return Array.isArray(addresses) ? addresses.sort().join('|') : addresses
}
