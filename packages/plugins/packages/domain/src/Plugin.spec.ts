import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoDomainPlugin } from './Plugin'
import { XyoDomainSchema } from './Schema'

describe('XyoDomainPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoDomainPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoDomainSchema)).toBeObject()
  })
})
