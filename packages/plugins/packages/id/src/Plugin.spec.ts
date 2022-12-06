import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoIdPlugin } from './Plugin'
import { XyoIdSchema } from './Schema'

describe('XyoIdPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoIdPlugin())
    expect(resolver.resolve({ schema: XyoIdSchema })).toBeObject()
    expect(resolver.witness(XyoIdSchema)).toBeObject()
  })
})
