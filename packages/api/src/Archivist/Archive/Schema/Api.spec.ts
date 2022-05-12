import { XyoApiConfig } from '../../../models'
import { XyoArchivistApi } from '../../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoArchivistSchemaApi', () => {
  describe('schema', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive('foo').schema('foo.bar.baz').config.root
      expect(path).toBe('/archive/foo/schema/foo.bar.baz/')
    })
  })
  describe('recent', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive('foo').schema('foo.bar.baz').recent.config.root
      expect(path).toBe('/archive/foo/schema/foo.bar.baz/recent/')
    })
  })
})
