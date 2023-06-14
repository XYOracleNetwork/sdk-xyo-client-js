import { ModuleParams } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { WitnessWrapper } from '@xyo-network/witness'

import { AdhocWitness, AdhocWitnessConfig, AdhocWitnessConfigSchema } from '../Witness'

describe('AdhocWitness', () => {
  describe('observe', () => {
    const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).build()
    const config: AdhocWitnessConfig = { payload, schema: AdhocWitnessConfigSchema }
    const params: ModuleParams<AdhocWitnessConfig> = { config }
    describe('with payload supplied to observe', () => {
      const observed = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
      it('uses payload schema', async () => {
        const witness = await AdhocWitness.create(params)
        const observation = await witness.observe([observed])
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
      it('uses payload schema with WitnessWrapper', async () => {
        const witness = await AdhocWitness.create(params)
        const wrapper = WitnessWrapper.wrap(witness)
        const observation = await wrapper.observe([observed])
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
    })
  })
})
