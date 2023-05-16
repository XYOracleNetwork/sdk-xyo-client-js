import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { UrlPayloadPlugin } from '../Plugin'

describe('UrlPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = UrlPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
