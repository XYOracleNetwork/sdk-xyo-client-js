import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { ConfigPayloadPlugin } from '../Plugin.js'

describe('ConfigPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ConfigPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
