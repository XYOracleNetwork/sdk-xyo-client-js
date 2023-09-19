import { HDWallet } from '@xyo-network/account'
import { isValuePayload } from '@xyo-network/value-payload-plugin'

import { EnvironmentWitnessConfigSchema } from '../Config'
import { EnvironmentSubset, EnvironmentSubsetSchema } from '../Payload'
import { EnvironmentWitness } from '../Witness'

describe('EnvironmentWitness', () => {
  let sut: EnvironmentWitness
  beforeAll(async () => {
    const config = { schema: EnvironmentWitnessConfigSchema }
    const wallet = await HDWallet.random()
    sut = await EnvironmentWitness.create({ config, wallet })
  })
  describe('witness', () => {
    describe('without template payload', () => {
      it('should return the environment', async () => {
        const result = await sut.observe()
        expect(result).toBeArrayOfSize(1)
        const env = result.filter(isValuePayload)[0]
        expect(env).toBeDefined()
        expect(env.values).toBeDefined()
        expect(env.values).toEqual(process.env)
      })
    })
    describe('with subset payload', () => {
      it('should return only the environment subset', async () => {
        const template: EnvironmentSubset = { schema: EnvironmentSubsetSchema, values: ['PATH'] }
        const result = await sut.observe([template])
        expect(result).toBeArrayOfSize(1)
        const env = result.filter(isValuePayload)[0]
        expect(env).toBeDefined()
        expect(env.values).toContainAllKeys(template.values)
        expect(env.values.PATH).toEqual(process.env.PATH)
      })
    })
  })
})
