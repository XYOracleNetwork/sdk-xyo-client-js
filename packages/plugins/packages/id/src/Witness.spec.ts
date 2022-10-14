import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      config: {
        salt: 'test',
        schema: XyoIdWitnessConfigSchema,
        targetSchema: XyoIdSchema,
      },
    })
    const [observation] = await witness.observe([{ salt: 'test' }])
    expect(observation.schema).toBe('network.xyo.id')
  })
})
