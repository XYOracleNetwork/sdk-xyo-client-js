/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { LocationCertaintyDivinerConfigSchema } from './Diviner'
import { LocationCertaintyPayloadPlugin } from './Plugin'
import { LocationCertaintySchema } from './Schema'

describe('LocationCertaintyPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(LocationCertaintyPayloadPlugin(), {
      diviner: { config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema } },
    })
    expect(resolver.resolve({ schema: LocationCertaintySchema })).toBeObject()
    expect(resolver.diviner(LocationCertaintySchema)).toBeObject()
  })
})
