/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoModuleInstancePayloadPlugin } from './Plugin'
import { XyoModuleInstanceSchema } from './Schema'

describe('XyoModuleInstancePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoModuleInstancePayloadPlugin(), {
      witness: {},
    })
    expect(resolver.resolve({ schema: XyoModuleInstanceSchema })).toBeObject()
    expect(resolver.witness(XyoModuleInstanceSchema)).toBeObject()
  })
})
