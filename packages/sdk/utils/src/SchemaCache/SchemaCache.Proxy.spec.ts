import { XyoSchemaCache } from './SchemaCache'

describe('SchemaCache.Proxy', () => {
  test('Bad Proxy', async () => {
    const cache = XyoSchemaCache.instance
    cache.proxy = 'http://foo.com'

    const fetchedPayload = await cache.get('network.xyo.schema')
    expect(fetchedPayload).toBeNull()
  })
})
