import { AddressPayload, AddressSchema } from '@xyo-network/module-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

import { getApi } from './ApiUtil.spec.ts'

describe('ArchivistApi', () => {
  describe('get', () => {
    it('returns Node Discover', async () => {
      const api = getApi()
      expect(api).toBeDefined()
      const response = await api.get()
      expect(response).toBeArray()

      expect(response).toBeArray()
      const addressPayload = response?.find(p => p.schema === AddressSchema) as AddressPayload
      expect(addressPayload).toBeObject()
      expect(addressPayload.address).toBeString()

      const queries = response?.filter(d => d.schema === QuerySchema) as QueryPayload[]
      expect(queries.length).toBeGreaterThan(0)
    })
  })
})
