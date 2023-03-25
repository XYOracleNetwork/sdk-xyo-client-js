import { assertEx } from '@xylabs/assert'
import { XyoDomainPayload, XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { XyoNetworkNodeSchema, XyoNetworkSchema } from '@xyo-network/network'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { SchemaCache } from '../SchemaCache'

const proxy = 'https://beta.api.archivist.xyo.network/domain'

const exampleDomainConfig: XyoDomainPayload = {
  aliases: {
    [XyoSchemaSchema]: {
      huri: '548476cc8388e97c7a724c77ffc89b8b858b66ee009750797405d264c570b260',
    },
  },
  networks: [
    {
      name: 'Main',
      nodes: [
        {
          name: 'XYO Archivist',
          schema: XyoNetworkNodeSchema,
          slug: 'xyo',
          type: 'archivist',
          uri: 'https://api.archivist.xyo.network',
          web: 'https://archivist.xyo.network',
        },
      ],
      schema: XyoNetworkSchema,
      slug: 'main',
    },
  ],
  schema: XyoDomainSchema,
}

describe('XyoSchemaCache', () => {
  beforeEach(() => {
    SchemaCache.instance.proxy = proxy
  })

  test('Valid', async () => {
    const cache = SchemaCache.instance
    const fetchedPayload = await cache.get(XyoSchemaSchema)
    expect(fetchedPayload?.payload.schema).toBe(XyoSchemaSchema)
  })

  describe('validator', () => {
    describe('provides strongly typed validator for known schema type', () => {
      test('Payload', async () => {
        const schema = PayloadSchema
        const cache = SchemaCache.instance
        const fetchedPayload = await cache.get(schema)
        expect(fetchedPayload).toBeTruthy()
        const payloads: Payload[] = [
          new PayloadBuilder({ schema }).fields({ a: 'a' }).build(),
          new PayloadBuilder({ schema }).fields({ b: 'b' }).build(),
          new PayloadBuilder({ schema }).fields({ c: 'c' }).build(),
        ]
        const validator = assertEx(cache.validators[schema])
        // Strongly typing variable to ensure TypeScript inferred type from validator matches
        const valid: Payload[] = payloads.filter(validator)
        expect(valid.length).toBe(payloads.length)
      })
      test('XyoDomainConfig', async () => {
        const schema = XyoDomainSchema
        const cache = SchemaCache.instance
        const fetchedPayload = await cache.get(schema)
        expect(fetchedPayload).toBeTruthy()
        const payloads = [new PayloadBuilder<XyoDomainPayload>({ schema }).fields(exampleDomainConfig).build()]
        const validator = assertEx(cache.validators[schema])
        // Strongly typing variable to ensure TypeScript inferred type from validator matches
        const valid: XyoDomainPayload[] = payloads.filter(validator)
        expect(valid.length).toBe(payloads.length)
      })
    })
  })

  test('Not In Cache', async () => {
    const cache = SchemaCache.instance
    const fetchedPayload = await cache.get('foo.domain.com')
    expect(fetchedPayload).toBeNull()
  })

  test('Set Proxy', () => {
    const cache = SchemaCache.instance
    const testProxy = 'http://foo.com'
    cache.proxy = testProxy
    expect(cache?.proxy).toBe(testProxy)
  })
})
