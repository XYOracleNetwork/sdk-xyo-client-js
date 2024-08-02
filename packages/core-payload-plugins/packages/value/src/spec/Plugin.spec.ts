import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { ValuePayloadPlugin } from '../Plugin.ts'

describe('ValuePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ValuePayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
