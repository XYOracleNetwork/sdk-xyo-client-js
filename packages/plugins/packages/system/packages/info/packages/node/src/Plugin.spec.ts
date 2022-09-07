import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoPayloadPlugin } from './Plugin'
import { XyoNodeSystemInfoSchema } from './Schema'

describe('XyoBowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoNodeSystemInfoPayloadPlugin())
    expect(resolver.resolve({ schema: XyoNodeSystemInfoSchema })).toBeObject()
    expect(resolver.witness(XyoNodeSystemInfoSchema)).toBeObject()
  })
})
