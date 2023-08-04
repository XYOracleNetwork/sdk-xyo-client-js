import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { NftCollectionScoreDivinerPlugin } from '../Plugin'

describe('NftCollectionScoreDivinerPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = NftCollectionScoreDivinerPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
