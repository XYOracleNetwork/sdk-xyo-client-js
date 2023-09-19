import { HDWallet } from '@xyo-network/account'

import { EnvironmentWitnessConfigSchema } from '../Config'
import { EnvironmentTemplateSchema, isEnvironmentPayload } from '../Payload'
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
        const env = result.filter(isEnvironmentPayload)[0]
        expect(env).toBeDefined()
        expect(env.env).toBeDefined()
        expect(env.env).toEqual(process.env)
      })
    })
    describe('with template payload', () => {
      it('should return just the environment from the template', async () => {
        const template = {
          placeholders: {
            environmentPath: 'PATH',
          },
          schema: EnvironmentTemplateSchema,
          value: '{environmentPath}',
        }
        const result = await sut.observe([template])
        expect(result).toBeArrayOfSize(1)
        const env = result.filter(isEnvironmentPayload)[0]
        expect(env).toBeDefined()
        expect(env.env).toBeDefined()
        expect(env.env?.path).toEqual(process.env?.PATH)
      })
    })
  })
})
