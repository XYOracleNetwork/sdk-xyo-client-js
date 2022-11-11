import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { XyoWitnessWrapper } from '@xyo-network/witness'

import { XyoAdhocWitness, XyoAdhocWitnessConfig, XyoAdhocWitnessConfigSchema } from './Witness'

const targetSchema = 'network.xyo.schema.target'

describe('XyoAdhocWitness', () => {
  describe('observe', () => {
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.debug' }).build()
    const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema }
    const params: XyoModuleParams<XyoAdhocWitnessConfig> = { config }
    describe('with no payload supplied to observe', () => {
      it('uses targetSchema', async () => {
        const witness = await XyoAdhocWitness.create(params)
        const observation = await witness.observe()
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(config.targetSchema)
      })
      it('uses targetSchema with XyoWitnessWrapper', async () => {
        const witness = await XyoAdhocWitness.create(params)
        const wrapper = new XyoWitnessWrapper(witness)
        const observation = await wrapper.observe()
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(config.targetSchema)
      })
    })
    describe('with payload supplied to observe', () => {
      const observed = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
      it('uses payload schema', async () => {
        const witness = await XyoAdhocWitness.create(params)
        const observation = await witness.observe([observed])
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
      it('uses payload schema with XyoWitnessWrapper', async () => {
        const witness = await XyoAdhocWitness.create(params)
        const wrapper = new XyoWitnessWrapper(witness)
        const observation = await wrapper.observe([observed])
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
    })
  })
})
