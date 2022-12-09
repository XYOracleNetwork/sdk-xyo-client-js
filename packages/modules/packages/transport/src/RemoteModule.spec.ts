import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { BoundWitnessBuilder, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { QueryBoundWitnessBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoNodeRegisteredQuerySchema } from '../../node/dist/esm'
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
    })
  })
})
