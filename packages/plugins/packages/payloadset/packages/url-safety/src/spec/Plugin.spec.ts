import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { UrlPlugin } from '../Plugin'

describe('UrlPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = UrlPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(UrlSchema)).toBeObject()
  })
})
