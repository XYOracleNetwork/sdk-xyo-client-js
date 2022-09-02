import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoPayloadPlugin } from './Plugin'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'

describe('XyoBowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoNodeSystemInfoPayloadPlugin())
    expect(resolver.resolve({ schema: XyoNodeSystemInfoPayloadSchema })).toBeObject()
    expect(resolver.witness(XyoNodeSystemInfoPayloadSchema)).toBeObject()
  })
})
