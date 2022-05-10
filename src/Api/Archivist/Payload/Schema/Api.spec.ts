import { XyoApiConfig } from '../../../models'
import { XyoArchivistApi } from '../../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoArchivistArchivePayloadSchemaApi', () => {
  describe('get', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive('foo').payload.schema.config.root
      expect(path).toBe('/archive/foo/payload/schema/')
    })
  })
  describe('stats', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive('foo').payload.schema.stats.config.root
      expect(path).toBe('/archive/foo/payload/schema/stats/')
    })
  })
})
