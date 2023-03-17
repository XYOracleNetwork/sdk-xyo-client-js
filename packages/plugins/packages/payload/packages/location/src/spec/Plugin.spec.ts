import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { LocationPayloadPlugin } from '../Plugin'

describe('LocationPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = LocationPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
