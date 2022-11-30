import { XyoApiConfig } from '@xyo-network/api-models'

import { XyoArchivistApi } from './Api'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

describe('XyoArchivistApi', () => {
  describe('get', () => {
    it('returns Node Description', () => {
      const api = new XyoArchivistApi(configData)
      expect(api).toBeDefined()
      throw new Error('TODO: GET here')
    })
  })
})
