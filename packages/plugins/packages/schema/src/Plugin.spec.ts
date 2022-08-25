import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoSchemaPayloadPlugin } from './Plugin'
import { XyoSchemaPayloadSchema } from './Schema'

describe('XyoSchemaPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoSchemaPayloadPlugin())
    expect(resolver.resolve({ schema: XyoSchemaPayloadSchema })).toBeObject()
    expect(resolver.witness(XyoSchemaPayloadSchema)).toBeObject()
  })
})
