/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { LocationCertaintyDivinerConfigSchema } from './Diviner'
import { LocationCertaintyPlugin } from './Plugin'
import { LocationCertaintySchema } from './Schema'

describe('LocationCertaintyPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = LocationCertaintyPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      diviner: { config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema } },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.diviner(LocationCertaintySchema)).toBeObject()
  })
})
