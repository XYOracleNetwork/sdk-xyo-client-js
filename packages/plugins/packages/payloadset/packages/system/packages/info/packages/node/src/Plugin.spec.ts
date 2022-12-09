import { XyoNodeSystemInfoSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoNodeSystemInfoPlugin } from './Plugin'

describe('XyoBowserSystemInfoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoNodeSystemInfoPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoNodeSystemInfoSchema)).toBeObject()
  })
})
