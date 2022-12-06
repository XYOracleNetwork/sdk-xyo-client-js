import { PayloadWrapper } from '@xyo-network/payload'

import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness', () => {
  describe('observe', () => {
    const payloadSalt = 'payload salt'
    describe('with config', () => {
      const configSalt = 'config salt'
      const config = {
        salt: configSalt,
        schema: XyoIdWitnessConfigSchema,
        targetSchema: XyoIdSchema,
      }
      describe('with payloads supplied to observe', () => {
        it('without salt uses config salt', async () => {
          const witness = await XyoIdWitness.create({ config })
          const observations = (await witness.observe()) as XyoIdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(witness.config.salt)
        })
        it('with salt uses payload salt', async () => {
          const witness = await XyoIdWitness.create({ config })
          const observations = (await witness.observe([{ salt: payloadSalt, schema: XyoIdSchema }])) as XyoIdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(payloadSalt)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses config salt', async () => {
          const witness = await XyoIdWitness.create({ config })
          const observations = (await witness.observe()) as XyoIdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(witness.config.salt)
        })
      })
    })
    describe('with no config', () => {
      describe('with payloads supplied to observe', () => {
        it('without salt uses random numeric string', async () => {
          const witness = await XyoIdWitness.create()
          const observations = (await witness.observe()) as XyoIdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(parseInt(observation.salt)).toBeInteger()
        })
        it('with salt uses payload salt', async () => {
          const witness = await XyoIdWitness.create()
          const observations = (await witness.observe([{ salt: payloadSalt, schema: XyoIdSchema }])) as XyoIdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(payloadSalt)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses random numeric string', async () => {
          const witness = await XyoIdWitness.create()
          const observations = (await witness.observe()) as XyoIdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(parseInt(observation.salt)).toBeInteger()
        })
      })
    })
  })
})

const validateObservationShape = (observations: XyoIdPayload[]) => {
  expect(observations).toBeArrayOfSize(1)
  const [observation] = observations
  expect(observation.salt).toBeString()
  expect(observation.schema).toBe(XyoIdSchema)
  expect(new PayloadWrapper(observation).valid).toBe(true)
}
