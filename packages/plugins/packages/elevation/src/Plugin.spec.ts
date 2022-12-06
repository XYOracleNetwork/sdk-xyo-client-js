/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoLocationElevationPlugin } from './Plugin'
import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationWitnessConfigSchema } from './Witness'

describe('XyoLocationElevationPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoLocationElevationPlugin(), {
      witness: {
        config: { schema: XyoLocationElevationWitnessConfigSchema, targetSchema: XyoLocationElevationSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoLocationElevationSchema })).toBeObject()
    expect(resolver.witness(XyoLocationElevationSchema)).toBeObject()
  })
})
