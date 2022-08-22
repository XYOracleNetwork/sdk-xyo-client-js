/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'

import { XyoIdPayloadSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness [Browser]', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      account: new XyoAccount(),
      schema: XyoIdWitnessConfigSchema,
      targetSchema: XyoIdPayloadSchema,
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.id')
  })
})
