import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { NodeSystemInfoPayloadPlugin } from '../Plugin'

describe('BrowserSystemInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = NodeSystemInfoPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
