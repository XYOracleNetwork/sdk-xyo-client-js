import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoDomainPayloadPlugin } from './Plugin'
import { XyoDomainSchema } from './Schema'

describe('XyoDomainPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoDomainPayloadPlugin())
    expect(resolver.resolve({ schema: XyoDomainSchema })).toBeObject()
    expect(resolver.witness(XyoDomainSchema)).toBeObject()
  })
})
