import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { ElevationPayloadPlugin } from './Plugin'

describe('ElevationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ElevationPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
