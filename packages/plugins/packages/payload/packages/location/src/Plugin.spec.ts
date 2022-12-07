import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { LocationPayloadPlugin } from './Plugin'

describe('LocationPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = LocationPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
