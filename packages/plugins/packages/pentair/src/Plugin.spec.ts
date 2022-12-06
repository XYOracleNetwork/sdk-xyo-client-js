/**
 * @jest-environment jsdom
 */

import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoPentairScreenlogicPlugin } from './Plugin'
import { XyoPentairScreenlogicSchema } from './Schema'
import { XyoPentairScreenlogicWitnessConfigSchema } from './Witness'

describe('XyoPentairScreenlogicPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoPentairScreenlogicPlugin(), {
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
