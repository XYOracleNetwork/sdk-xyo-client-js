/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoPentairScreenlogicPlugin } from './Plugin'
import { XyoPentairScreenlogicSchema } from './Schema'
import { XyoPentairScreenlogicWitnessConfigSchema } from './Witness'

describe('XyoPentairScreenlogicPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoPentairScreenlogicPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: {
          schema: XyoPentairScreenlogicWitnessConfigSchema,
          targetSchema: XyoPentairScreenlogicSchema,
        },
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoPentairScreenlogicSchema)).toBeObject()
  })
})
