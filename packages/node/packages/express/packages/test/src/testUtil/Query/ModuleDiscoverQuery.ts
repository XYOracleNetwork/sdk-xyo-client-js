import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ModuleDiscoverQuerySchema, ModuleSubscribeQuerySchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

const validateAddress = (response: Payload[]) => {
  expect(response).toBeArray()
  expect(response.length).toBeGreaterThan(0)
  const addressPayload = response.find((p) => p.schema === AddressSchema) as AddressPayload
  expect(addressPayload).toBeObject()
  expect(addressPayload.address).toBeString()
  const { address } = addressPayload
  return { address }
}

const validateSupportedQueries = (response: Payload[], querySchemas: string[]) => {
  const queries = response.filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
  expect(queries.length).toBeGreaterThan(0)
  querySchemas.forEach((querySchema) => {
    expect(queries.some((p) => p.query === querySchema)).toBeTrue()
  })
}

export const validateDiscoverResponse = (response: Payload[], querySchemas: string[] = [ModuleDiscoverQuerySchema, ModuleSubscribeQuerySchema]) => {
  validateAddress(response)
  validateSupportedQueries(response, querySchemas)
}
