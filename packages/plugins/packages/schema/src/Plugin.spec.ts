import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoSchemaPlugin } from './Plugin'
import { XyoSchemaSchema } from './Schema'

describe('XyoSchemaPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoSchemaPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoSchemaSchema)).toBeObject()
  })
})
