import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoNodeSystemInfoPlugin } from './Plugin'
import { XyoNodeSystemInfoSchema } from './Schema'

describe('XyoBowserSystemInfoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoNodeSystemInfoPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoNodeSystemInfoSchema)).toBeObject()
  })
})
