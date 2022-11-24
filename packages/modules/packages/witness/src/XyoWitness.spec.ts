import { Module, XyoModule, XyoModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoWitnessConfig, XyoWitnessConfigSchema } from './Config'
import { Witness } from './Witness'
import { XyoWitness } from './XyoWitness'
import { WitnessWrapper } from './XyoWitnessWrapper'

const targetSchema = 'network.xyo.schema.target'

describe('XyoWitness', () => {
  const config: XyoWitnessConfig = { schema: XyoWitnessConfigSchema, targetSchema }
  const params: XyoModuleParams<XyoWitnessConfig> = { config }
  const observed = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()

  describe('fulfills type of', () => {
    it('Module', async () => {
      const witness: Module = await XyoWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper(witness)
      expect(wrapper).toBeObject()
    })
    it('XyoModule', async () => {
      const witness: XyoModule = await XyoWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper(witness)
      expect(wrapper).toBeObject()
    })
    it('Witness', async () => {
      const witness: Witness = await XyoWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper(witness)
      expect(wrapper).toBeObject()
    })
  })
  describe('observe', () => {
    describe('with no payload supplied to observe', () => {
      describe('returns empty array', () => {
        it('when module queried directly', async () => {
          const witness = await XyoWitness.create(params)
          const observation = await witness.observe()
          expect(observation).toBeArrayOfSize(0)
        })
        it('when module queried with XyoWitnessWrapper', async () => {
          const witness = await XyoWitness.create(params)
          const wrapper = new WitnessWrapper(witness)
          const observation = await wrapper.observe()
          expect(observation).toBeArrayOfSize(0)
        })
      })
    })
    describe('with payload supplied to observe', () => {
      describe('returns payloads with targetSchema', () => {
        it('when module queried directly', async () => {
          const witness = await XyoWitness.create(params)
          const observation = await witness.observe([observed])
          expect(observation).toBeArrayOfSize(1)
          expect(observation?.[0]?.schema).toBe(targetSchema)
        })
        it('when module queried with XyoWitnessWrapper', async () => {
          const witness = await XyoWitness.create(params)
          const wrapper = new WitnessWrapper(witness)
          const observation = await wrapper.observe([observed])
          expect(observation).toBeArrayOfSize(1)
          expect(observation?.[0]?.schema).toBe(targetSchema)
        })
      })
    })
  })
})
