import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { DomainPayloadPlugin } from './Plugin'

describe('DomainPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = DomainPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
