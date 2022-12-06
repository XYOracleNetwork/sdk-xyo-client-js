/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CurrentLocationWitnessConfigSchema } from './CurrentLocationWitness'
import { LocationPlugin } from './Plugin'
import { CurrentLocationSchema } from './Schema'

describe('LocationPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = LocationPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: {
          schema: CurrentLocationWitnessConfigSchema,
        },
        geolocation: navigator.geolocation,
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(CurrentLocationSchema)).toBeObject()
  })
})
