/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoLocationElevationPayloadPlugin } from './Plugin'
import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationWitnessConfigSchema } from './Witness'

describe('XyoLocationElevationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoLocationElevationPayloadPlugin(), {
      witness: {
        config: { schema: XyoLocationElevationWitnessConfigSchema, targetSchema: XyoLocationElevationSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoLocationElevationSchema })).toBeObject()
    expect(resolver.witness(XyoLocationElevationSchema)).toBeObject()
  })
})
