import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { Module, ModuleParams } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { AbstractWitness } from '../AbstractWitness'
import { WitnessConfig, WitnessConfigSchema } from '@xyo-network/witness-model'
import { WitnessModule } from '@xyo-network/witness-model'
import { WitnessWrapper } from '@xyo-network/witness-wrapper'

describe('Witness', () => {
  const config: WitnessConfig = { schema: WitnessConfigSchema }
  const params: ModuleParams<WitnessConfig> = { config }
  const observed = new PayloadBuilder({ schema: 'network.xyo.test' }).build()

  describe('fulfills type of', () => {
    let account: AccountInstance
    beforeAll(() => {
      account = Account.random()
    })
    it('Module', async () => {
      const witness: Module = await AbstractWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper({ account, module: witness })
      expect(wrapper).toBeObject()
    })
    it('AbstractModule', async () => {
      const witness = await AbstractWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper({ account, module: witness })
      expect(wrapper).toBeObject()
    })
    it('WitnessModule', async () => {
      const witness: WitnessModule = await AbstractWitness.create(params)
      expect(witness).toBeObject()
      const wrapper = new WitnessWrapper({ account, module: witness })
      expect(wrapper).toBeObject()
    })
  })
  describe('observe', () => {
    describe('with payload supplied to observe', () => {
      describe('returns payloads', () => {
        let account: AccountInstance
        beforeAll(() => {
          account = Account.random()
        })
        it('when module queried directly', async () => {
          const witness = await AbstractWitness.create(params)
          const observation = await witness.observe([observed])
          expect(observation).toBeArrayOfSize(1)
        })
        it('when module queried with WitnessWrapper', async () => {
          const witness = await AbstractWitness.create(params)
          const wrapper = new WitnessWrapper({ account, module: witness })
          const observation = await wrapper.observe([observed])
          expect(observation).toBeArrayOfSize(1)
        })
      })
    })
  })
})
