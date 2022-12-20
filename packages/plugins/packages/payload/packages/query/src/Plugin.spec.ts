import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { QueryPayloadPlugin } from './Plugin'

describe('QueryPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = QueryPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
