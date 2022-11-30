import { XyoApiError } from '@xyo-network/api-models'

import { getApi } from '../ApiUtil.spec'

describe('XyoArchivistArchivesApi', () => {
  describe('get', function () {
    it('gets an array of archives owned', async () => {
      const api = getApi()
      try {
        const response = await api.archives.get()
        throw new Error('Assert response here')
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })
})
