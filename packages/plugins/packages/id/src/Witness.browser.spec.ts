/**
 * @jest-environment jsdom
 */

import { XyoIdSchema } from './Schema'
import { XyoIdWitness } from './Witness'

describe('XyoIdWitness [Browser]', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      salt: 'test',
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe(XyoIdSchema)
  })
})
