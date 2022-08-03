import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import Plugin from './index'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(Plugin())
    expect(resolver.resolve({ schema: 'network.xyo.location' })).toBeDefined()
  })
})
