/**
 * @jest-environment jsdom
 */

import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayloadPlugin } from './Plugin'
import { XyoPentairScreenlogicSchema } from './Schema'
import { XyoPentairScreenlogicWitnessConfigSchema } from './Witness'

describe('XyoPentairScreenlogicPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoPentairScreenlogicPayloadPlugin(), {
      witness: {
        config: {
          schema: XyoPentairScreenlogicWitnessConfigSchema,
          targetSchema: XyoPentairScreenlogicSchema,
        },
      },
    })
    expect(resolver.resolve({ schema: XyoPentairScreenlogicSchema })).toBeObject()
    expect(resolver.witness(XyoPentairScreenlogicSchema)).toBeObject()
  })
})
