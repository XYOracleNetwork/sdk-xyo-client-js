import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { BowserSystemInfoPayloadPlugin } from './Plugin'

describe('BowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = BowserSystemInfoPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
