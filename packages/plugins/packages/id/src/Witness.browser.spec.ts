/**
 * @jest-environment jsdom
 */

import { PayloadWrapper } from '@xyo-network/payload'

import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness [Browser]', () => {
  test('observe', async () => {
    const witness = await XyoIdWitness.create({
      config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema },
    })
    const [observation] = await witness.observe([{ salt: 'test' }])
    expect(observation.schema).toBe(XyoIdSchema)
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })

  test('observe [no config]', async () => {
    const witness = await XyoIdWitness.create()
    const [observation] = await witness.observe([{ salt: 'test' }])
    expect(observation.schema).toBe(XyoIdSchema)
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })
})
