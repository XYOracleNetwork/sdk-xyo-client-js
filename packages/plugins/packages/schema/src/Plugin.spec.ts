import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoSchemaPayloadPlugin } from './Plugin'
import { XyoSchemaSchema } from './Schema'

describe('XyoSchemaPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoSchemaPayloadPlugin())
    expect(resolver.resolve({ schema: XyoSchemaSchema })).toBeObject()
    expect(resolver.witness(XyoSchemaSchema)).toBeObject()
  })
})
