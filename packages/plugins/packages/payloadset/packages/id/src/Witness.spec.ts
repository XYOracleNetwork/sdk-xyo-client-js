import { IdPayload, IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload'

import { IdWitness, IdWitnessConfigSchema } from './Witness'

describe('IdWitness', () => {
  describe('observe', () => {
    const payloadSalt = 'payload salt'
    describe('with config', () => {
      const configSalt = 'config salt'
      const config = {
        salt: configSalt,
        schema: IdWitnessConfigSchema,
        targetSchema: IdSchema,
      }
      describe('with payloads supplied to observe', () => {
        it('without salt uses config salt', async () => {
          const witness = await IdWitness.create({ config })
          const observations = (await witness.observe()) as IdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(witness.config.salt)
        })
        it('with salt uses payload salt', async () => {
          const witness = await IdWitness.create({ config })
          const observations = (await witness.observe([{ salt: payloadSalt, schema: IdSchema }])) as IdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(payloadSalt)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses config salt', async () => {
          const witness = await IdWitness.create({ config })
          const observations = (await witness.observe()) as IdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(witness.config.salt)
        })
      })
    })
    describe('with no config', () => {
      describe('with payloads supplied to observe', () => {
        it('without salt uses random numeric string', async () => {
          const witness = await IdWitness.create()
          const observations = (await witness.observe()) as IdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(parseInt(observation.salt)).toBeInteger()
        })
        it('with salt uses payload salt', async () => {
          const witness = await IdWitness.create()
          const observations = (await witness.observe([{ salt: payloadSalt, schema: IdSchema }])) as IdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(payloadSalt)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses random numeric string', async () => {
          const witness = await IdWitness.create()
          const observations = (await witness.observe()) as IdPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(parseInt(observation.salt)).toBeInteger()
        })
      })
    })
  })
})

const validateObservationShape = (observations: IdPayload[]) => {
  expect(observations).toBeArrayOfSize(1)
  const [observation] = observations
  expect(observation.salt).toBeString()
  expect(observation.schema).toBe(IdSchema)
  expect(new PayloadWrapper(observation).valid).toBe(true)
}
