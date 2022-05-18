import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/core'
import { XyoDomainConfig } from '@xyo-network/domain'

import { XyoSchemaCache } from './SchemaCache'

const proxy = 'https://beta.api.archivist.xyo.network/domain'

const exampleDomainConfig: XyoDomainConfig = {
  aliases: {
    'network.xyo.schema': {
      huri: '548476cc8388e97c7a724c77ffc89b8b858b66ee009750797405d264c570b260',
    },
  },
  networks: [
    {
      name: 'Main',
      nodes: [
        {
          name: 'XYO Archivist',
          slug: 'xyo',
          type: 'archivist',
          uri: 'https://api.archivist.xyo.network',
          web: 'https://archivist.xyo.network',
        },
      ],
      slug: 'main',
    },
  ],
  schema: 'network.xyo.domain',
}

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
    test('provides strongly typed validator for known schema type (XyoPayload)', async () => {
      const schema = 'network.xyo.payload'
      const cache = XyoSchemaCache.instance
      const fetchedPayload = await cache.get(schema)
      expect(fetchedPayload).toBeTruthy()
      const payloads = [
        new XyoPayloadBuilder({ schema }).fields({ a: 'a' }).build(),
        new XyoPayloadBuilder({ schema }).fields({ b: 'b' }).build(),
        new XyoPayloadBuilder({ schema }).fields({ c: 'c' }).build(),
      ]
      const validator = cache.validatorMap[schema]
      expect(validator).toBeTruthy()
      // Strongly typing variable to ensure TypeScript inferred type from validator matches
      const valid: XyoPayload[] = payloads.filter(validator)
      expect(valid).toBeTruthy()
      expect(Array.isArray(valid)).toBeTruthy()
      expect(valid.length).toBe(payloads.length)
    })
    test('provides strongly typed validator for known schema type (XyoDomainConfig)', async () => {
      const schema = 'network.xyo.domain'
      const cache = XyoSchemaCache.instance
      const fetchedPayload = await cache.get(schema)
      expect(fetchedPayload).toBeTruthy()
      // const payloads = [new XyoPayloadBuilder({ schema }).fields(exampleDomainConfig).build()]
      const payloads = [exampleDomainConfig]
      const validator = cache.validatorMap[schema]
      expect(validator).toBeTruthy()
      // Strongly typing variable to ensure TypeScript inferred type from validator matches
      const valid: XyoDomainConfig[] = payloads.filter(validator)
      expect(valid).toBeTruthy()
      expect(Array.isArray(valid)).toBeTruthy()
      expect(valid.length).toBe(payloads.length)
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
