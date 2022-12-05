/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoLocationWitnessConfigSchema } from './CurrentLocationWitness'
import { XyoLocationPayloadPlugin } from './Plugin'
import { XyoLocationSchema } from './Schema'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoLocationPayloadPlugin(), {
      witness: {
        config: {
          schema: XyoLocationWitnessConfigSchema,
          targetSchema: XyoLocationSchema,
        },
        geolocation: navigator.geolocation,
      },
    })
    expect(resolver.resolve({ schema: XyoLocationSchema })).toBeObject()
    expect(resolver.witness(XyoLocationSchema)).toBeObject()
  })
})
