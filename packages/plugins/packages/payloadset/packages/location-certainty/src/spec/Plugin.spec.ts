/**
 * @jest-environment jsdom
 */

import { LocationCertaintySchema } from '@xyo-network/location-certainty-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { LocationCertaintyDivinerConfigSchema } from '../Diviner'
import { LocationCertaintyPlugin } from '../Plugin'

describe('LocationCertaintyPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = LocationCertaintyPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.diviner(LocationCertaintySchema)).toBeObject()
  })
})
