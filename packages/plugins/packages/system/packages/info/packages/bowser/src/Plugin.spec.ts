import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoPayloadPlugin } from './Plugin'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'

describe('XyoBowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoBowserSystemInfoPayloadPlugin())
    expect(resolver.resolve({ schema: XyoBowserSystemInfoPayloadSchema })).toBeDefined()
  })
})
