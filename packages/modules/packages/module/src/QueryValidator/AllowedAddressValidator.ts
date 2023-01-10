import { AddressString, SchemaString } from '@xyo-network/module-model'

import { Queryable } from './QueryValidator'

type SortedPipedAddressesString = string

export const allowedAddressValidator: Queryable = (query, mod) => {
  const schema = query.query.schema
  const addresses = query.addresses
  const allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
  const disallowedAddresses: Record<SchemaString, AddressString[]> = mod.config.security?.disallowed || {}

  if (mod.config.security?.allowed) {
    Object.entries(mod.config.security?.allowed).forEach(([schema, addressesList]) => {
      allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
    })
  }
  const queryAllowed = (schema: SchemaString, addresses: SortedPipedAddressesString[]) => {
    return allowedAddressSets?.[schema]?.includes(addresses.sort().join('|'))
  }

  const queryDisallowed = (schema: SchemaString, addresses: string[]) => {
    return addresses.reduce((previousValue, address) => previousValue || disallowedAddresses?.[schema]?.includes(address), false)
  }
  return addresses ? queryAllowed(schema, addresses) ?? !queryDisallowed(schema, addresses) ?? true : true
}
