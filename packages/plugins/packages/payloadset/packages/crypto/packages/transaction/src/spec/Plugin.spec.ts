import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { AddressTransactionHistoryPlugin } from '../Plugin'

describe('AddressTransactionHistoryPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = AddressTransactionHistoryPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
