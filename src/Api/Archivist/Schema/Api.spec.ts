import { XyoApiConfig } from '../../models'
import { XyoArchivistApi } from '../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoArchivistSchemaApi', () => {
  it('calculates the correct path', () => {
    const api = new XyoArchivistApi(config)
    const path = api.schema('foo.bar.baz').config.root
    expect(path).toBe('/schema/foo.bar.baz/')
  })
})
