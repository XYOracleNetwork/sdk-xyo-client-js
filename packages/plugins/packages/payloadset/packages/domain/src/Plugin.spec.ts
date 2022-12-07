import { XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { DomainPlugin } from './Plugin'

describe('DomainPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = DomainPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoDomainSchema)).toBeObject()
  })
})
