import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMovePlugin } from '../Plugin'

describe('XyoCryptoCardsMovePlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = XyoCryptoCardsMovePlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    const witness = await resolver.witness(plugin.set)
    expect(witness).toBeObject()
    //const observation = await witness?.observe()
    //expect(observation?.length).toBeGreaterThan(0)
  })
})
