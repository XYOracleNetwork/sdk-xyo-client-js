import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { LocationCertaintyPayloadPlugin } from './Plugin'

describe('LocationCertaintyPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = LocationCertaintyPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
