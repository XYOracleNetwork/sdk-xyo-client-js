import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { NftScoreDivinerPlugin } from '../Plugin'

describe('NftScoreDivinerPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = NftScoreDivinerPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
