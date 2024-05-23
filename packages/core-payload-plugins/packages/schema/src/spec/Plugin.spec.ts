import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { SchemaPayloadPlugin } from '../Plugin'

describe('SchemaPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = SchemaPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
