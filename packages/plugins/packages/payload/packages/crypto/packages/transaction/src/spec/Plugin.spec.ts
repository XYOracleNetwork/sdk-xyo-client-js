import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { AddressTransactionHistoryPayloadPlugin } from '../Plugin'

describe('AddressTransactionHistoryPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = AddressTransactionHistoryPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
