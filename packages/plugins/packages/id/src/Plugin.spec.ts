import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoIdPayloadPlugin } from './Plugin'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoIdPayloadPlugin())
    expect(resolver.resolve({ schema: 'network.xyo.id' })).toBeDefined()
  })
})
