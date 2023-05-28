import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { XyoSchemaPlugin } from '../Plugin'

describe('XyoSchemaPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = XyoSchemaPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoSchemaSchema)).toBeObject()
  })
})
