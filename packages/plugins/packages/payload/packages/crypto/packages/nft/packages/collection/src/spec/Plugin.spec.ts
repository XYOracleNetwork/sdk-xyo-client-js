import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { NftCollectionInfoPayloadPlugin } from '../Plugin'

describe('NftCollectionInfoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = NftCollectionInfoPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
