/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoElevationPayloadPlugin } from './Plugin'
import { XyoElevationSchema } from './Schema'

describe('XyoElevationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoElevationPayloadPlugin(), {
      witness: {},
    })
    expect(resolver.resolve({ schema: XyoElevationSchema })).toBeObject()
    expect(resolver.witness(XyoElevationSchema)).toBeObject()
  })
})
