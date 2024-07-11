import { Account } from '@xyo-network/account'
import { isValuePayload } from '@xyo-network/value-payload-plugin'

import { EnvironmentWitnessConfigSchema } from '../Config.js'
import { EnvironmentSubset, EnvironmentSubsetSchema } from '../Payload'
import { EnvironmentWitness } from '../Witness'

/**
 * @group witness
 * @group module
 */

describe('EnvironmentWitness', () => {
  let sut: EnvironmentWitness
  beforeAll(async () => {
    const config = { schema: EnvironmentWitnessConfigSchema }
    const account = await Account.random()
    sut = await EnvironmentWitness.create({ account, config })
  })
  describe('witness', () => {
    describe('without template payload', () => {
      it('should return the environment', async () => {
        const result = await sut.observe()
        expect(result).toBeArrayOfSize(1)
        const env = result.find(isValuePayload)
        expect(env).toBeDefined()
        expect(env?.value).toBeDefined()
        expect(env?.value).toEqual(process.env)
      })
    })
    describe('with subset payload', () => {
      it('should return only the environment subset', async () => {
        type EnvironmentWithPath = { PATH: string }
        const template: EnvironmentSubset = { schema: EnvironmentSubsetSchema, values: ['PATH'] }
        const result = await sut.observe([template])
        expect(result).toBeArrayOfSize(1)
        const env = result.find(isValuePayload)
        expect(env).toBeDefined()
        expect(env?.value).toContainAllKeys(template.values)
        expect((env?.value as EnvironmentWithPath)?.PATH).toEqual(process.env.PATH)
      })
    })
  })
})
