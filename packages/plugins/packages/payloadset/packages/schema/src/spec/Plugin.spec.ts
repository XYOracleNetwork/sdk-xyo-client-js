import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'
import { SchemaSchema } from '@xyo-network/schema-payload-plugin'

import { SchemaPlugin } from '../Plugin'

describe('SchemaPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = SchemaPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(SchemaSchema)).toBeObject()
  })
})
