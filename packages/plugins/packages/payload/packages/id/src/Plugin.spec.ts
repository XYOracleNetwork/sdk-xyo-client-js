import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { IdPayloadPlugin } from './Plugin'

describe('IdPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = IdPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
