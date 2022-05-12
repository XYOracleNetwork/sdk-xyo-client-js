import { XyoSchemaCache } from './SchemaCache'

const proxy = 'https://beta.api.archivist.xyo.network/domain'

describe('XyoSchemaCache', () => {
  beforeEach(() => {
    XyoSchemaCache.instance.proxy = proxy
  })

  test('Valid', async () => {
    const cache = XyoSchemaCache.instance
    const fetchedPayload = await cache.get('network.xyo.schema')
    expect(fetchedPayload?.payload.schema).toBe('network.xyo.schema')
  })

  test('Not In Cache', async () => {
    const cache = XyoSchemaCache.instance
    const fetchedPayload = await cache.get('foo.domain.com')
    expect(fetchedPayload).toBeNull()
  })

  test('Set Proxy', () => {
    const cache = XyoSchemaCache.instance
    const testProxy = 'http://foo.com'
    cache.proxy = testProxy
    expect(cache?.proxy).toBe(testProxy)
  })
})
