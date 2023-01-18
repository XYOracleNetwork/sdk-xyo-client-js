import { AbstractModuleConfig, AbstractModuleQuery, AddressString, CosigningAddressSet, SchemaString } from '@xyo-network/module-model'
import { add } from 'lodash'

import { QueryBoundWitnessWrapper } from '../Query'
import { Queryable, QueryValidator } from './QueryValidator'

export type SortedPipedAddressesString = string

export class ModuleConfigQueryValidator<TConfig extends AbstractModuleConfig = AbstractModuleConfig> implements QueryValidator {
  protected allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
  protected disallowedAddresses: Record<SchemaString, AddressString[]> = {}
  protected readonly hasRules: boolean

  constructor(config?: TConfig) {
    if (config?.security?.allowed) {
      Object.entries(config.security?.allowed).forEach(([schema, addressesList]) => {
        this.allowedAddressSets[schema] = addressesList.map(toAddressesString)
      })
    }
    // TODO: ToLowerCase
    this.disallowedAddresses = config?.security?.disallowed || {}
    this.hasRules = Object.keys(this.allowedAddressSets).length > 0 || Object.keys(this.allowedAddressSets).length > 0
  }

  queryable: Queryable = (query, payloads) => {
    if (!this.hasRules) return true
    const addresses = query.addresses
    if (!addresses.length) return false
    const wrapper = QueryBoundWitnessWrapper.parseQuery<AbstractModuleQuery>(query, payloads)
    const schema = wrapper.query.schema
    return this.queryAllowed(schema, addresses) && !this.queryDisallowed(schema, addresses)
  }

  protected queryAllowed = (schema: SchemaString, addresses: string[]) => {
    // All cosigners must sign
    if (addresses.length > 1) {
      const signatories = toAddressesString(addresses)
      const validCosigners = this.allowedAddressSets?.[schema]?.includes(signatories)
      if (validCosigners) return true
    }
    // OR all signers have to be allowed individually
    return addresses.every((address) => this.allowedAddressSets?.[schema]?.includes(address) || false)
  }
  protected queryDisallowed = (schema: SchemaString, addresses: string[]) => {
    return addresses.reduce((previousValue, address) => previousValue || this.disallowedAddresses?.[schema]?.includes(address), false)
  }
}

const toAddressesString = (addresses: string | CosigningAddressSet): SortedPipedAddressesString => {
  return Array.isArray(addresses)
    ? addresses
        .sort()
        .map((address) => address.toLowerCase())
        .join('|')
    : addresses.toLowerCase()
}
