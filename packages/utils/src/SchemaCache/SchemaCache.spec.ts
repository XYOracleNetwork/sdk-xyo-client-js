import { XyoBoundWitness, XyoBoundWitnessBuilder, XyoPayload, XyoPayloadBuilder } from '@xyo-network/core'

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

  describe('validator', () => {
    test('provides strongly typed validator for known schema type', async () => {
      const schema = 'network.xyo.payload'
      const cache = XyoSchemaCache.instance
      const fetchedPayload = await cache.get(schema)
      expect(fetchedPayload).toBeTruthy()
      const payloads = [
        new XyoPayloadBuilder({ schema }).fields({ a: 'a' }).build(),
        new XyoPayloadBuilder({ schema }).fields({ b: 'b' }).build(),
        new XyoPayloadBuilder({ schema }).fields({ c: 'c' }).build(),
      ]
      const validator = cache.validator(schema)
      const validPayloads = payloads.filter<XyoPayload>(validator)
      expect(validPayloads).toBeTruthy()
      expect(Array.isArray(validPayloads)).toBeTruthy()
      expect(validPayloads.length).toBe(payloads.length)
    })
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
