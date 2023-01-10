import { SchemaString } from '@xyo-network/module-model'

import { Queryable } from './QueryValidator'

export const allowedAddressValidator: Queryable = (query, mod) => {
  const schema = query.query.schema
  const addresses = query.addresses
  const allowedAddressSets: Record<SchemaString, string[]> = {}
  if (mod.config.security?.allowed) {
    Object.entries(mod.config.security?.allowed).forEach(([schema, addressesList]) => {
      allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
    })
  }
  const queryAllowed = (schema: SchemaString, addresses: string[]) => {
    return allowedAddressSets?.[schema]?.includes(addresses.sort().join('|'))
  }

  const queryDisallowed = (schema: SchemaString, addresses: string[]) => {
    const disallowedAddresses = mod.config.security?.disallowed || {}
    return addresses.reduce((previousValue, address) => previousValue || disallowedAddresses?.[schema]?.includes(address), false)
  }
  return addresses ? queryAllowed(schema, addresses) ?? !queryDisallowed(schema, addresses) ?? true : true
}
