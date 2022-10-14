/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoLocationElevationPayloadPlugin } from './Plugin'
import { XyoLocationElevationSchema } from './Schema'

describe('XyoLocationElevationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoLocationElevationPayloadPlugin(), {
      witness: {},
    })
    expect(resolver.resolve({ schema: XyoLocationElevationSchema })).toBeObject()
    expect(resolver.witness(XyoLocationElevationSchema)).toBeObject()
  })
})
