import { HDWallet } from '@xyo-network/account'

import { EnvironmentWitnessConfigSchema } from '../Config'
import { isEnvironmentPayload } from '../Payload'
import { EnvironmentWitness } from '../Witness'

describe('EnvironmentWitness', () => {
  let sut: EnvironmentWitness
  beforeAll(async () => {
    const config = { schema: EnvironmentWitnessConfigSchema }
    const wallet = await HDWallet.random()
    sut = await EnvironmentWitness.create({ config, wallet })
  })
  describe('witness', () => {
    describe('with template payload', () => {
      it.skip('should return just the environment from the template', () => {})
    })
    describe('without template payload', () => {
      it('should return the environment', async () => {
        const result = await sut.observe()
        expect(result).toBeArrayOfSize(1)
        const env = result.filter(isEnvironmentPayload)[0]
        expect(env).toBeDefined()
        expect(env.env).toBeDefined()
        expect(env.env).toEqual(process.env)
      })
    })
  })
})
