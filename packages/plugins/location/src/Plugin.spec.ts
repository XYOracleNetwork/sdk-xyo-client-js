import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoLocationPayloadSchema } from './Payload'
import { XyoLocationPayloadPlugin } from './Plugin'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoLocationPayloadPlugin())
    expect(resolver.resolve({ schema: XyoLocationPayloadSchema })).toBeDefined()
  })
})
