import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { PentairScreenlogicPayloadPlugin } from '../Plugin'

describe('PentairScreenlogicPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = PentairScreenlogicPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
