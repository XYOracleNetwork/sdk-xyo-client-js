/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CurrentLocationWitnessConfigSchema } from './CurrentLocationWitness'
import { LocationPayloadPlugin } from './Plugin'
import { CurrentLocationSchema } from './Schema'

describe('LocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(LocationPayloadPlugin(), {
      witness: {
        config: {
          schema: CurrentLocationWitnessConfigSchema,
        },
        geolocation: navigator.geolocation,
      },
    })
    expect(resolver.resolve({ schema: CurrentLocationSchema })).toBeObject()
    expect(resolver.witness(CurrentLocationSchema)).toBeObject()
  })
})
