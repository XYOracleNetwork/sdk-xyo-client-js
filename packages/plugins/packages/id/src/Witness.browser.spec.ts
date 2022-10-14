/**
 * @jest-environment jsdom
 */

import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness [Browser]', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema },
    })
    const [observation] = await witness.observe([{ salt: 'test' }])
    expect(observation.schema).toBe(XyoIdSchema)
  })
})
