import { XyoApiConfig } from '@xyo-network/api-models'

import { XyoArchivistApi } from '../../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoArchivistSchemasApi', () => {
  describe('schema', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive('foo').schemas.config.root
      expect(path).toBe('/archive/foo/schema/')
    })
  })
  describe('recent', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive('foo').schemas.recent.config.root
      expect(path).toBe('/archive/foo/schema/recent/')
    })
  })
})
