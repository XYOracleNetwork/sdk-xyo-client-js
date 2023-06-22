import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { NftInfoPayloadPlugin } from '../Plugin'

describe('NftInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = NftInfoPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
