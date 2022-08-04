import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoLocationPayloadPlugin } from './Plugin'
import { XyoLocationPayloadSchema } from './Schema'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoLocationPayloadPlugin())
    expect(resolver.resolve({ schema: XyoLocationPayloadSchema })).toBeDefined()
  })
})
