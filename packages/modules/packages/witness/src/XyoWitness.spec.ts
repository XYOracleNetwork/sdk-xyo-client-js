import { Module, XyoModule, XyoModuleParams } from '@xyo-network/module'
import { PayloadWrapper, XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoWitnessConfig, XyoWitnessConfigSchema } from './Config'
import { Witness } from './Witness'
import { XyoWitness } from './XyoWitness'
import { XyoWitnessWrapper } from './XyoWitnessWrapper'

const targetSchema = 'network.xyo.schema.target'

describe('XyoWitness', () => {
  test('types', async () => {
    const schema = 'network.xyo.debug'
    const witness = await XyoWitness.create({
      config: { schema: XyoWitnessConfigSchema, targetSchema },
    })
    const payload = new XyoPayloadBuilder({ schema }).build()
    const witnessAsModule: Module = witness
    const witnessAsWitness: Witness = witness
    const witnessAsXyoModule: XyoModule = witness
    const wrapper = new XyoWitnessWrapper(witnessAsModule ?? witnessAsXyoModule ?? witnessAsWitness)

    const payloads = await wrapper.observe([payload])
    expect(payloads).toBeArray()
    expect(payloads.length).toBeGreaterThan(0)
    const answerWrapper = new PayloadWrapper(payloads[0])

    expect(answerWrapper.schema).toBe(schema)
    expect(answerWrapper.valid).toBe(true)
  })
  describe('observe', () => {
    const config: XyoWitnessConfig = { schema: XyoWitnessConfigSchema, targetSchema }
    const params: XyoModuleParams<XyoWitnessConfig> = { config }
    describe('with no payload supplied to observe', () => {
      describe('returns empty array', () => {
        it('when module queried directly', async () => {
          const witness = await XyoWitness.create(params)
          const observation = await witness.observe()
          expect(observation).toBeArrayOfSize(0)
        })
        it('when module queried with XyoWitnessWrapper', async () => {
          const witness = await XyoWitness.create(params)
          const wrapper = new XyoWitnessWrapper(witness)
          const observation = await wrapper.observe()
          expect(observation).toBeArrayOfSize(0)
        })
      })
    })
    describe('with payload supplied to observe', () => {
      describe('returns payloads with targetSchema', () => {
        const observed = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
        it('when module queried directly', async () => {
          const witness = await XyoWitness.create(params)
          const observation = await witness.observe([observed])
          expect(observation).toBeArrayOfSize(1)
          expect(observation?.[0]?.schema).toBe(targetSchema)
        })
        it('when module queried with XyoWitnessWrapper', async () => {
          const witness = await XyoWitness.create(params)
          const wrapper = new XyoWitnessWrapper(witness)
          const observation = await wrapper.observe([observed])
          expect(observation).toBeArrayOfSize(1)
          expect(observation?.[0]?.schema).toBe(targetSchema)
        })
      })
    })
  })
})
