import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoIdPlugin } from './Plugin'
import { XyoIdSchema } from './Schema'

describe('XyoIdPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoIdPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoIdSchema)).toBeObject()
  })
})
