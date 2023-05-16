import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'

import { UrlWitness, UrlWitnessConfigSchema } from '../Witness'

describe('UrlWitness', () => {
  describe('observe', () => {
    const payloadSalt = 'payload salt'
    describe('with config', () => {
      const configSalt = 'config salt'
      const config = {
        salt: configSalt,
        schema: UrlWitnessConfigSchema,
        targetSchema: UrlSchema,
      }
      describe('with payloads supplied to observe', () => {
        it('without salt uses config salt', async () => {
          const witness = await UrlWitness.create({ config })
          const observations = (await witness.observe()) as UrlPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(witness.config.salt)
        })
        it('with salt uses payload salt', async () => {
          const witness = await UrlWitness.create({ config })
          const observations = (await witness.observe([{ salt: payloadSalt, schema: UrlSchema }] as UrlPayload[])) as UrlPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(payloadSalt)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses config salt', async () => {
          const witness = await UrlWitness.create({ config })
          const observations = (await witness.observe()) as UrlPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(witness.config.salt)
        })
      })
    })
    describe('with no config', () => {
      describe('with payloads supplied to observe', () => {
        it('without salt uses random numeric string', async () => {
          const witness = await UrlWitness.create()
          const observations = (await witness.observe()) as UrlPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(parseInt(observation.salt)).toBeInteger()
        })
        it('with salt uses payload salt', async () => {
          const witness = await UrlWitness.create()
          const observations = (await witness.observe([{ salt: payloadSalt, schema: UrlSchema } as Payload])) as UrlPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(observation.salt).toBe(payloadSalt)
        })
      })
      describe('with no payloads supplied to observe', () => {
        it('uses random numeric string', async () => {
          const witness = await UrlWitness.create()
          const observations = (await witness.observe()) as UrlPayload[]
          validateObservationShape(observations)
          const [observation] = observations
          expect(parseInt(observation.salt)).toBeInteger()
        })
      })
    })
  })
})

const validateObservationShape = (observations: UrlPayload[]) => {
  expect(observations).toBeArrayOfSize(1)
  const [observation] = observations
  expect(observation.salt).toBeString()
  expect(observation.schema).toBe(UrlSchema)
  expect(new PayloadWrapper(observation).valid).toBe(true)
}
