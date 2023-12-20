import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { ConfigPayloadPlugin } from '../Plugin'

describe('ConfigPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ConfigPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
