import { AbstractModule, Module, ModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'

import { AbstractWitness } from './AbstractWitness'
import { XyoWitnessConfig, XyoWitnessConfigSchema } from './Config'
import { Witness } from './Witness'
import { WitnessWrapper } from './WitnessWrapper'

describe('XyoWitness', () => {
  const config: XyoWitnessConfig = { schema: XyoWitnessConfigSchema }
  const params: ModuleParams<XyoWitnessConfig> = { config }
  const observed = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()

  describe('fulfills type of', () => {
    it('Module', async () => {
      const witness: Module = await AbstractWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper(witness)
      expect(wrapper).toBeObject()
    })
    it('AbstractModule', async () => {
      const witness: AbstractModule = await AbstractWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper(witness)
      expect(wrapper).toBeObject()
    })
    it('Witness', async () => {
      const witness: Witness = await AbstractWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper(witness)
      expect(wrapper).toBeObject()
    })
  })
  describe('observe', () => {
    describe('with no payload supplied to observe', () => {
      describe('returns empty array', () => {
        it('when module queried directly', async () => {
          const witness = await AbstractWitness.create(params)
          const observation = await witness.observe()
          expect(observation).toBeArrayOfSize(0)
        })
        it('when module queried with XyoWitnessWrapper', async () => {
          const witness = await AbstractWitness.create(params)
          const wrapper = new WitnessWrapper(witness)
          const observation = await wrapper.observe()
          expect(observation).toBeArrayOfSize(0)
        })
      })
    })
    describe('with payload supplied to observe', () => {
      describe('returns payloads', () => {
        it('when module queried directly', async () => {
          const witness = await AbstractWitness.create(params)
          const observation = await witness.observe([observed])
          expect(observation).toBeArrayOfSize(1)
        })
        it('when module queried with XyoWitnessWrapper', async () => {
          const witness = await AbstractWitness.create(params)
          const wrapper = new WitnessWrapper(witness)
          const observation = await wrapper.observe([observed])
          expect(observation).toBeArrayOfSize(1)
        })
      })
    })
  })
})
