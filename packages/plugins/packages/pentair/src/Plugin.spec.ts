/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayloadPlugin } from './Plugin'
import { XyoPentairScreenlogicSchema } from './Schema'

describe('XyoPentairScreenlogicPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoPentairScreenlogicPayloadPlugin(), {
      witness: {},
    })
    expect(resolver.resolve({ schema: XyoPentairScreenlogicSchema })).toBeObject()
    expect(resolver.witness(XyoPentairScreenlogicSchema)).toBeObject()
  })
})
