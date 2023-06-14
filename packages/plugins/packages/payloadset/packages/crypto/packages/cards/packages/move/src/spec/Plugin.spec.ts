import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CryptoCardsMovePlugin } from '../Plugin'

describe('CryptoCardsMovePlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CryptoCardsMovePlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    const witness = await resolver.witness(plugin.set)
    expect(witness).toBeObject()
    //const observation = await witness?.observe()
    //expect(observation?.length).toBeGreaterThan(0)
  })
})
