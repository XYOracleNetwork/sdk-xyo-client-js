import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { ModuleInstancePayloadPlugin } from './Plugin'

describe('ModuleInstancePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ModuleInstancePayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
