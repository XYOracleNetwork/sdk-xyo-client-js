import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { QueryBoundWitnessBuilder } from '@xyo-network/module'
import { XyoNodeRegisteredQuerySchema } from '@xyo-network/node'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { RemoteModule } from './RemoteModule'

describe('RemoteModule', () => {
  let sut: RemoteModule
  beforeAll(async () => {
    const api: XyoArchivistApi = new XyoArchivistApi({
      apiDomain: 'http://localhost:8080',
    })
    const address = assertEx((await api.get())?.address)
    sut = new RemoteModule(api, address)
  })
  describe('description', () => {
    it('returns module description', async () => {
      const response = await sut.description()
      expect(response).toBeObject()
      expect(response.address).toBeString()
      expect(response.queries).toBeArray()
      expect(response.queries.length).toBeGreaterThan(0)
    })
  })
  describe('query', () => {
    it('queries the module', async () => {
      const queryPayload = new XyoPayloadBuilder({ schema: XyoNodeRegisteredQuerySchema }).build()
      const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
      const response = await sut.query(query[0], [...query[1]])
      expect(response).toBeTruthy()
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
    })
  })
})
