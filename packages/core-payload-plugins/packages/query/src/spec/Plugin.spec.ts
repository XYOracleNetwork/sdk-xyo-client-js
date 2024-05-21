import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { QueryPayloadPlugin } from '../Plugin'

describe('QueryPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = QueryPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
