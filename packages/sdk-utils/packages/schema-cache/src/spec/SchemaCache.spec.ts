import { assertEx } from '@xylabs/assert'
import { DomainPayload, DomainSchema } from '@xyo-network/domain-payload-plugin'
import { NetworkNodeSchema, NetworkSchema } from '@xyo-network/network'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { SchemaSchema } from '@xyo-network/schema-payload-plugin'

import { SchemaCache } from '../SchemaCache'

const exampleDomainConfig: DomainPayload = {
  aliases: {
    [SchemaSchema]: {
      huri: '548476cc8388e97c7a724c77ffc89b8b858b66ee009750797405d264c570b260',
    },
  },
  networks: [
    {
      name: 'Main',
      nodes: [
        {
          name: 'XYO Archivist',
          schema: NetworkNodeSchema,
          slug: 'xyo',
          type: 'archivist',
          uri: 'https://api.archivist.xyo.network',
          web: 'https://archivist.xyo.network',
        },
      ],
      schema: NetworkSchema,
      slug: 'main',
    },
  ],
  schema: DomainSchema,
}

describe('SchemaCache', () => {
  test('Valid', async () => {
    const cache = SchemaCache.instance
    const fetchedPayload = await cache.get(SchemaSchema)
    expect(fetchedPayload?.payload.schema).toBe(SchemaSchema)
  })

  describe('validator', () => {
    describe('provides strongly typed validator for known schema type', () => {
      test('Payload', async () => {
        const schema = PayloadSchema
        const cache = SchemaCache.instance
        const fetchedPayload = await cache.get(schema)
        expect(fetchedPayload).toBeTruthy()
        const payloads: Payload[] = [
          await new PayloadBuilder({ schema }).fields({ a: 'a' }).build(),
          await new PayloadBuilder({ schema }).fields({ b: 'b' }).build(),
          await new PayloadBuilder({ schema }).fields({ c: 'c' }).build(),
        ]
        const validator = assertEx(cache.validators[schema])
        // Strongly typing variable to ensure TypeScript inferred type from validator matches
        const valid: Payload[] = payloads.filter(validator)
        expect(valid.length).toBe(payloads.length)
      })
      test('DomainConfig', async () => {
        const schema = DomainSchema
        const cache = SchemaCache.instance
        const fetchedPayload = await cache.get(schema)
        expect(fetchedPayload).toBeTruthy()
        const payloads = [await new PayloadBuilder<DomainPayload>({ schema }).fields(exampleDomainConfig).build()]
        const validator = assertEx(cache.validators[schema])
        // Strongly typing variable to ensure TypeScript inferred type from validator matches
        const valid: DomainPayload[] = payloads.filter(validator)
        expect(valid.length).toBe(payloads.length)
      })
    })
  })

  test('Not In Cache', async () => {
    const cache = SchemaCache.instance
    const fetchedPayload = await cache.get('foo.domain.com')
    expect(fetchedPayload).toBeNull()
  })
})
