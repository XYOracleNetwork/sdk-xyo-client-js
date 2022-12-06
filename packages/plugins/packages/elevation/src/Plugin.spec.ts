/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoLocationElevationPlugin } from './Plugin'
import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationWitnessConfigSchema } from './Witness'

describe('XyoLocationElevationPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoLocationElevationPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: { schema: XyoLocationElevationWitnessConfigSchema, targetSchema: XyoLocationElevationSchema },
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoLocationElevationSchema)).toBeObject()
  })
})
