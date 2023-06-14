import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'
import { PentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'

import { PentairScreenlogicPlugin } from '../Plugin'
import { PentairScreenlogicWitnessConfigSchema } from '../Witness'

describe('PentairScreenlogicPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = PentairScreenlogicPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: {
        schema: PentairScreenlogicWitnessConfigSchema,
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(PentairScreenlogicSchema)).toBeObject()
  })
})
