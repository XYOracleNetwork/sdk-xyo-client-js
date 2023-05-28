import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { IdPlugin } from '../Plugin'

describe('IdPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = IdPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(IdSchema)).toBeObject()
  })
})
