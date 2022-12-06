import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoNodeSystemInfoPlugin } from './Plugin'
import { XyoNodeSystemInfoSchema } from './Schema'

describe('XyoBowserSystemInfoPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoNodeSystemInfoPlugin())
    expect(resolver.resolve({ schema: XyoNodeSystemInfoSchema })).toBeObject()
    expect(resolver.witness(XyoNodeSystemInfoSchema)).toBeObject()
  })
})
