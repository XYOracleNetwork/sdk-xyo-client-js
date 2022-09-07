import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoPayloadPlugin } from './Plugin'
import { XyoBowserSystemInfoSchema } from './Schema'

describe('XyoBowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoBowserSystemInfoPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve({ schema: XyoBowserSystemInfoSchema })).toBeObject()
    expect(resolver.witness(XyoBowserSystemInfoSchema)).toBeObject()
  })
})
