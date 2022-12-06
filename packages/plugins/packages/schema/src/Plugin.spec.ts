import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoSchemaPlugin } from './Plugin'
import { XyoSchemaSchema } from './Schema'

describe('XyoSchemaPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoSchemaPlugin())
    expect(resolver.resolve({ schema: XyoSchemaSchema })).toBeObject()
    expect(resolver.witness(XyoSchemaSchema)).toBeObject()
  })
})
