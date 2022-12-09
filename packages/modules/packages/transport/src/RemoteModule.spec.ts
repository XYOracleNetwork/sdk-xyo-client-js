import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { QueryBoundWitnessBuilder } from '@xyo-network/module'
import { XyoNodeRegisteredQuerySchema } from '@xyo-network/node'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { RemoteModule } from './RemoteModule'

describe('RemoteModule', () => {
  describe('query', () => {
    it('queries', async () => {
      const api: XyoArchivistApi = new XyoArchivistApi({
        apiDomain: 'http://localhost:8080',
      })
      const address = assertEx((await api.get())?.address)
      const sut = new RemoteModule(api, address)
      const queryPayload = new XyoPayloadBuilder({ schema: XyoNodeRegisteredQuerySchema }).build()
      const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
      const response = await sut.query(query[0], query[1])
      expect(response).toBeTruthy()
    })
  })
})
