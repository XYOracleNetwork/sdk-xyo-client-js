import { PayloadWrapper } from '@xyo-network/payload'

import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness', () => {
  describe('observe', () => {
    describe('with config', () => {
      const configSalt = 'config salt'
      const inlineSalt = 'inline salt'
      const config = {
        salt: configSalt,
        schema: XyoIdWitnessConfigSchema,
        targetSchema: XyoIdSchema,
      }
      describe('with payloads supplied to observe', () => {
        it('without salt uses config salt', async () => {
          const witness = await XyoIdWitness.create({ config })
          const [observation] = await witness.observe([{ schema: XyoIdSchema }])
          expect(observation.schema).toBe(XyoIdSchema)
          expect(observation.salt).toBe(witness.config.salt)
          expect(new PayloadWrapper(observation).valid).toBe(true)
        })
        it('with salt uses inline salt', async () => {
          const witness = await XyoIdWitness.create({ config })
          const [observation] = await witness.observe([{ salt: inlineSalt }])
          expect(observation.schema).toBe(XyoIdSchema)
          expect(observation.salt).toBe(inlineSalt)
          expect(new PayloadWrapper(observation).valid).toBe(true)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses inline salt', async () => {
          const witness = await XyoIdWitness.create({ config })
          const [observation] = await witness.observe()
          expect(observation.schema).toBe(XyoIdSchema)
          expect(observation.salt).toBe(witness.config.salt)
          expect(new PayloadWrapper(observation).valid).toBe(true)
        })
      })
    })
    describe('with no config', () => {
      test('returns result', async () => {
        const witness = await XyoIdWitness.create()
        const [observation] = await witness.observe([{ salt: 'test' }])
        expect(observation.schema).toBe(XyoIdSchema)
        expect(new PayloadWrapper(observation).valid).toBe(true)
      })
    })
  })
})
