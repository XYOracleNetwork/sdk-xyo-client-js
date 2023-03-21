import { XyoNodeAttachedQuerySchema, XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeRegisteredQuerySchema } from '@xyo-network/node-model'
import { Payload } from '@xyo-network/payload-model'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { getRequestClient, validateDiscoverResponse } from '../../testUtil'

describe('/', () => {
  describe('responds with', () => {
    const client = getRequestClient()
    it(`status code of ${ReasonPhrases.OK}`, async () => {
      const result = await client.get('/')
      expect(result.status).toBe(StatusCodes.OK)
    })
    it('the root node discover', async () => {
      const result = await client.get('/')
      const response: Payload[] = result.data
      expect(response).toBeDefined()
      expect(response).toBeArray()
      validateDiscoverResponse(response, [
        XyoNodeAttachQuerySchema,
        XyoNodeDetachQuerySchema,
        XyoNodeAttachedQuerySchema,
        XyoNodeRegisteredQuerySchema,
      ])
    })
  })
})
