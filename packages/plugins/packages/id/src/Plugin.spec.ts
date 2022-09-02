import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoIdPayloadPlugin } from './Plugin'
import { XyoIdPayloadSchema } from './Schema'

describe('XyoIdPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoIdPayloadPlugin())
    expect(resolver.resolve({ schema: XyoIdPayloadSchema })).toBeObject()
    expect(resolver.witness(XyoIdPayloadSchema)).toBeObject()
  })
})
