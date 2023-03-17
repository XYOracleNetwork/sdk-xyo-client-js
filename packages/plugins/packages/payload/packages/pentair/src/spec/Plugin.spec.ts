import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayloadPlugin } from '../Plugin'

describe('XyoPentairScreenlogicPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoPentairScreenlogicPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
