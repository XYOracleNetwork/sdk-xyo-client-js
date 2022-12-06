import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoDomainPlugin } from './Plugin'
import { XyoDomainSchema } from './Schema'

describe('XyoDomainPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoDomainPlugin())
    expect(resolver.resolve({ schema: XyoDomainSchema })).toBeObject()
    expect(resolver.witness(XyoDomainSchema)).toBeObject()
  })
})
