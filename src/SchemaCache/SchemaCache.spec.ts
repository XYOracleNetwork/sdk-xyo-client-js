import { XyoSchemaCache } from './SchemaCache'

describe('DomainConfigWrapper', () => {
  test('Valid', async () => {
    const cache = XyoSchemaCache.instance
    const payload = await cache.get('network.xyo.schema')
    expect(payload?.schema).toBe('network.xyo.schema')
  })
})
