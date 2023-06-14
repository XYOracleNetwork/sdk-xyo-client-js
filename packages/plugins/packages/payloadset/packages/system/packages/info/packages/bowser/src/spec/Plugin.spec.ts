import { BowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { BowserSystemInfoPlugin } from '../Plugin'

describe('BowserSystemInfoPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = BowserSystemInfoPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(BowserSystemInfoSchema)).toBeObject()
  })
})
