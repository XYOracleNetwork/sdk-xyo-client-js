import { XyoSchemaCache } from './SchemaCache'

describe('DomainConfigWrapper', () => {
  test('Valid', async () => {
    const cache = XyoSchemaCache.instance
    const fetchedPayload = await cache.get('network.xyo.schema')
    expect(fetchedPayload?.payload.schema).toBe('network.xyo.schema')
  })

  test('Set Proxy', async () => {
    const cache = XyoSchemaCache.instance
    const proxy = 'http://foo.com'
    cache.proxy = proxy
    expect(cache?.proxy).toBe(proxy)

    const fetchedPayload = await cache.get('network.xyo.schema')
    expect(fetchedPayload?.payload.schema).toBe('network.xyo.schema')
  })
})
