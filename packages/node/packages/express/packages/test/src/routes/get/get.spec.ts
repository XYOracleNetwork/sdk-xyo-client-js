import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoPayloads } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('/', () => {
  describe('responds with', () => {
    it(`status code of ${ReasonPhrases.OK}`, async () => {
      const result = await (await request()).get('/')
      expect(result.status).toBe(StatusCodes.OK)
    })
    it('the root node discover', async () => {
      const result = await (await request()).get('/')
      const response: XyoPayloads = result.body.data
      expect(response).toBeDefined()
      expect(response).toBeArray()
    })

    it('address', async () => {
      const result = await (await request()).get('/')
      const response: XyoPayloads = result.body.data
      expect(response).toBeArray()
      const addressPayload = response?.find((p) => p.schema === AddressSchema) as AddressPayload
      expect(addressPayload).toBeObject()
      expect(addressPayload.address).toBeString()
    })
    it('supported queries', async () => {
      const result = await (await request()).get('/')
      const response: XyoPayloads = result.body.data
      expect(response).toBeArray()
      const queries = response?.filter((d) => d.schema === QuerySchema) as QueryPayload[]
      expect(queries.length).toBeGreaterThan(0)
    })
  })
})
