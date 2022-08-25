import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoDomainPayloadPlugin } from './Plugin'
import { XyoDomainPayloadSchema } from './Schema'

describe('XyoDomainPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoDomainPayloadPlugin())
    expect(resolver.resolve({ schema: XyoDomainPayloadSchema })).toBeObject()
    expect(resolver.witness(XyoDomainPayloadSchema)).toBeObject()
  })
})
