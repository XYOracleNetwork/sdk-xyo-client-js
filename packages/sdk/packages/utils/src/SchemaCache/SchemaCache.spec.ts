import { assertEx } from '@xylabs/assert'
import { XyoDomainPayload, XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { XyoNetworkNodeSchema, XyoNetworkSchema } from '@xyo-network/network'
import { XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/payload-model'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { XyoSchemaCache } from './SchemaCache'

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
  test('Valid', async () => {
    const cache = XyoSchemaCache.instance
    const fetchedPayload = await cache.get(XyoSchemaSchema)
    expect(fetchedPayload?.payload.schema).toBe(XyoSchemaSchema)
  })

  describe('validator', () => {
    describe('provides strongly typed validator for known schema type', () => {
      test('XyoPayload', async () => {
        const schema = XyoPayloadSchema
        const cache = XyoSchemaCache.instance
        const fetchedPayload = await cache.get(schema)
        expect(fetchedPayload).toBeTruthy()
        const payloads: XyoPayload[] = [
          new XyoPayloadBuilder({ schema }).fields({ a: 'a' }).build(),
          new XyoPayloadBuilder({ schema }).fields({ b: 'b' }).build(),
          new XyoPayloadBuilder({ schema }).fields({ c: 'c' }).build(),
        ]
        const validator = assertEx(cache.validators[schema])
        // Strongly typing variable to ensure TypeScript inferred type from validator matches
        const valid: XyoPayload[] = payloads.filter(validator)
        expect(valid.length).toBe(payloads.length)
      })
      test('XyoDomainConfig', async () => {
        const schema = XyoDomainSchema
        const cache = XyoSchemaCache.instance
        const fetchedPayload = await cache.get(schema)
        expect(fetchedPayload).toBeTruthy()
        const payloads = [new XyoPayloadBuilder<XyoDomainPayload>({ schema }).fields(exampleDomainConfig).build()]
        const validator = assertEx(cache.validators[schema])
        // Strongly typing variable to ensure TypeScript inferred type from validator matches
        const valid: XyoDomainPayload[] = payloads.filter(validator)
        expect(valid.length).toBe(payloads.length)
      })
    })
  })

  test('Not In Cache', async () => {
    const cache = XyoSchemaCache.instance
    const fetchedPayload = await cache.get('foo.domain.com')
    expect(fetchedPayload).toBeNull()
  })
})
