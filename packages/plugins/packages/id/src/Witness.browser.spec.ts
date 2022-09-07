/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'

import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness [Browser]', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      account: new XyoAccount(),
      salt: 'test',
      schema: XyoIdWitnessConfigSchema,
      targetSchema: XyoIdSchema,
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe(XyoIdSchema)
  })
})
