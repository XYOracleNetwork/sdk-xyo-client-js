import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoIdPayloadPlugin } from './Plugin'
import { XyoIdSchema } from './Schema'

describe('XyoIdPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoIdPayloadPlugin())
    expect(resolver.resolve({ schema: XyoIdSchema })).toBeObject()
    expect(resolver.witness(XyoIdSchema)).toBeObject()
  })
})
