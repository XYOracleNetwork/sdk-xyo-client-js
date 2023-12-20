import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { AddressPayloadPlugin } from '../Plugin'

describe('AddressPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = AddressPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
