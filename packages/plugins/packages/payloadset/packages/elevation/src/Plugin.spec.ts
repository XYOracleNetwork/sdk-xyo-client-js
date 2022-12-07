/**
 * @jest-environment jsdom
 */

import { ElevationSchema } from '@xyo-network/elevation-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { ElevationPlugin } from './Plugin'
import { ElevationWitnessConfigSchema } from './Witness'

describe('ElevationPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ElevationPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: { schema: ElevationWitnessConfigSchema, targetSchema: ElevationSchema },
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(ElevationSchema)).toBeObject()
  })
})
