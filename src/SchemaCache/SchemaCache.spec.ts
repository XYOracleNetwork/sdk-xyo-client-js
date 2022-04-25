import { XyoSchemaCache } from './SchemaCache'

describe('DomainConfigWrapper', () => {
  test('Valid', async () => {
    const cache = XyoSchemaCache.instance
    const payload = await cache.get('network.xyo.schema')
    expect(payload?.schema).toBe('network.xyo.schema')
  })

  test('Set Proxy', () => {
    const cache = XyoSchemaCache.instance
    // Update once `/domain` endpoint is deployed to beta environment
    // and verify proxy can actually resolve requests
    const proxy = 'http://foo.com'
    cache.proxy = proxy
    expect(cache?.proxy).toBe(proxy)
  })
})
