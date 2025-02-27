import { Address } from '@xylabs/hex'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  AnyConfigSchema, CosigningAddressSet, ModuleConfig, ModuleQueries,
} from '@xyo-network/module-model'
import { Schema } from '@xyo-network/payload-model'

import { Queryable, QueryValidator } from './QueryValidator.ts'

// eslint-disable-next-line sonarjs/redundant-type-aliases
export type SortedPipedAddressesString = string

const delimiter = ''

export class ModuleConfigQueryValidator<TConfig extends AnyConfigSchema<ModuleConfig>> implements QueryValidator {
  protected allowed: Record<Schema, SortedPipedAddressesString[]> = {}
  protected disallowed: Record<Schema, SortedPipedAddressesString[]> = {}
  protected readonly hasAllowedRules: boolean
  protected readonly hasDisallowedRules: boolean
  protected readonly hasRules: boolean

  constructor(config?: TConfig) {
    if (config?.security?.allowed) {
      for (const [schema, addresses] of Object.entries(config.security?.allowed)) {
        this.allowed[schema] = addresses.map(toAddressesString)
      }
    }
    if (config?.security?.disallowed) {
      for (const [schema, addresses] of Object.entries(config.security?.disallowed)) {
        this.disallowed[schema] = addresses.map(toAddressesString)
      }
    }
    this.hasAllowedRules = Object.keys(this.allowed).length > 0
    this.hasDisallowedRules = Object.keys(this.disallowed).length > 0
    this.hasRules = this.hasAllowedRules || this.hasDisallowedRules
  }

  queryable: Queryable = async (query, payloads) => {
    if (!this.hasRules) return true
    const addresses = query.addresses
    if (addresses.length === 0) return false
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQueries>(query, payloads)
    const schema = (await wrapper.getQuery()).schema
    return this.queryAllowed(schema, addresses) && !this.queryDisallowed(schema, addresses)
  }

  protected queryAllowed = (schema: Schema, addresses: Address[]): boolean => {
    if (!this.hasAllowedRules) return true
    // All cosigners must sign
    if (addresses.length > 1) {
      const signatories = toAddressesString(addresses)
      const validCosigners = this.allowed?.[schema]?.includes(signatories)
      if (validCosigners) return true
    }
    // OR all signers have to be allowed individually
    return addresses.every(address => this.allowed?.[schema]?.includes(address) || false)
  }

  protected queryDisallowed = (schema: Schema, addresses: string[]): boolean => {
    if (!this.hasDisallowedRules) return false
    return addresses.some(address => this.disallowed?.[schema]?.includes(address))
  }
}

// TODO: Handle 0x prefix
const toAddressesString = (addresses: string | CosigningAddressSet): SortedPipedAddressesString => {
  return Array.isArray(addresses)
    ? addresses
        // eslint-disable-next-line sonarjs/no-alphabetical-sort
        .toSorted()
        .map(address => address.toLowerCase())
        .join(delimiter)
    : addresses.toLowerCase()
}
