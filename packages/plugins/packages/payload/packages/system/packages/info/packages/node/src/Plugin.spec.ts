import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { NodeSystemInfoPayloadPlugin } from './Plugin'

describe('BrowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = NodeSystemInfoPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
