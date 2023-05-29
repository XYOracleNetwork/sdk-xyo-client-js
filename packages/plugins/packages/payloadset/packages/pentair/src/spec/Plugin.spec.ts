import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'
import { XyoPentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'

import { XyoPentairScreenlogicPlugin } from '../Plugin'
import { XyoPentairScreenlogicWitnessConfigSchema } from '../Witness'

describe('XyoPentairScreenlogicPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = XyoPentairScreenlogicPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: {
        schema: XyoPentairScreenlogicWitnessConfigSchema,
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoPentairScreenlogicSchema)).toBeObject()
  })
})
