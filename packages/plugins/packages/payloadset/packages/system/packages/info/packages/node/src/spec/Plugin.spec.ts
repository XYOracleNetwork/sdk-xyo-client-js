import { NodeSystemInfoSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { NodeSystemInfoPlugin } from '../Plugin'

describe('BowserSystemInfoPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = NodeSystemInfoPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(NodeSystemInfoSchema)).toBeObject()
  })
})
