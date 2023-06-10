import { AddressString, AnyConfigSchema, CosigningAddressSet, ModuleConfig, ModuleQuery, SchemaString } from '@xyo-network/module-model'

import { QueryBoundWitnessWrapper } from '../Query'
import { Queryable, QueryValidator } from './QueryValidator'

export type SortedPipedAddressesString = string

const delimiter = ''

export class ModuleConfigQueryValidator<TConfig extends AnyConfigSchema<ModuleConfig>> implements QueryValidator {
  protected allowed: Record<SchemaString, SortedPipedAddressesString[]> = {}
  protected disallowed: Record<SchemaString, AddressString[]> = {}
  protected readonly hasAllowedRules: boolean
  protected readonly hasDisallowedRules: boolean
  protected readonly hasRules: boolean

  constructor(config?: TConfig) {
    if (config?.security?.allowed) {
      Object.entries(config.security?.allowed).forEach(([schema, addresses]) => {
        this.allowed[schema] = addresses.map(toAddressesString)
      })
    }
    if (config?.security?.disallowed) {
      Object.entries(config.security?.disallowed).forEach(([schema, addresses]) => {
        this.disallowed[schema] = addresses.map(toAddressesString)
      })
    }
    this.hasAllowedRules = Object.keys(this.allowed).length > 0
    this.hasDisallowedRules = Object.keys(this.disallowed).length > 0
    this.hasRules = this.hasAllowedRules || this.hasDisallowedRules
  }

  queryable: Queryable = async (query, payloads) => {
    if (!this.hasRules) return true
    const addresses = query.addresses
    if (!addresses.length) return false
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<ModuleQuery>(query, payloads)
    const schema = (await wrapper.getQuery()).schema
    return this.queryAllowed(schema, addresses) && !this.queryDisallowed(schema, addresses)
  }

  protected queryAllowed = (schema: SchemaString, addresses: string[]): boolean => {
    if (!this.hasAllowedRules) return true
    // All cosigners must sign
    if (addresses.length > 1) {
      const signatories = toAddressesString(addresses)
      const validCosigners = this.allowed?.[schema]?.includes(signatories)
      if (validCosigners) return true
    }
    // OR all signers have to be allowed individually
    return addresses.every((address) => this.allowed?.[schema]?.includes(address) || false)
  }
  protected queryDisallowed = (schema: SchemaString, addresses: string[]): boolean => {
    if (!this.hasDisallowedRules) return false
    return addresses.some((address) => this.disallowed?.[schema]?.includes(address))
  }
}

// TODO: Handle 0x prefix
const toAddressesString = (addresses: string | CosigningAddressSet): SortedPipedAddressesString => {
  return Array.isArray(addresses)
    ? addresses
        .sort()
        .map((address) => address.toLowerCase())
        .join(delimiter)
    : addresses.toLowerCase()
}
