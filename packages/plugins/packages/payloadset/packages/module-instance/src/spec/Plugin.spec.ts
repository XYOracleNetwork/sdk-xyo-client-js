/**
 * @jest-environment jsdom
 */

import { AbstractModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { AbstractModuleInstancePlugin } from '../Plugin'
import { AbstractModuleInstanceWitnessConfigSchema } from '../Witness'

describe('AbstractModuleInstancePlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = AbstractModuleInstancePlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { schema: AbstractModuleInstanceWitnessConfigSchema },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(AbstractModuleInstanceSchema)).toBeObject()
  })
})
