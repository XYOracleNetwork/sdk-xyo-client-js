import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { IdPayloadPlugin } from '../Plugin'

describe('IdPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = IdPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
