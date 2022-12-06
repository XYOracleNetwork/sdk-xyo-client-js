/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { LocationCertaintyDivinerConfigSchema } from './Diviner'
import { LocationCertaintyPlugin } from './Plugin'
import { LocationCertaintySchema } from './Schema'

describe('LocationCertaintyPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(LocationCertaintyPlugin(), {
      diviner: { config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema } },
    })
    expect(resolver.resolve({ schema: LocationCertaintySchema })).toBeObject()
    expect(resolver.diviner(LocationCertaintySchema)).toBeObject()
  })
})
