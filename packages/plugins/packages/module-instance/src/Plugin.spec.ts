/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoModuleInstancePlugin } from './Plugin'
import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstanceWitnessConfigSchema } from './Witness'

describe('XyoModuleInstancePlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoModuleInstancePlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: { schema: XyoModuleInstanceWitnessConfigSchema, targetSchema: XyoModuleInstanceSchema },
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoModuleInstanceSchema)).toBeObject()
  })
})
