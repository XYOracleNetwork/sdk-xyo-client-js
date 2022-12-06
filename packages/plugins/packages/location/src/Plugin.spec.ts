/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CurrentLocationWitnessConfigSchema } from './CurrentLocationWitness'
import { LocationPlugin } from './Plugin'
import { CurrentLocationSchema } from './Schema'

describe('LocationPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(LocationPlugin(), {
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
