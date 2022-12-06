/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoModuleInstancePlugin } from './Plugin'
import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstanceWitnessConfigSchema } from './Witness'

describe('XyoModuleInstancePlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoModuleInstancePlugin(), {
      witness: {
        config: { schema: XyoModuleInstanceWitnessConfigSchema, targetSchema: XyoModuleInstanceSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoModuleInstanceSchema })).toBeObject()
    expect(resolver.witness(XyoModuleInstanceSchema)).toBeObject()
  })
})
