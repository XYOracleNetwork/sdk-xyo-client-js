import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoAdhocWitness, XyoAdhocWitnessConfig, XyoAdhocWitnessConfigSchema } from './Witness'

describe('XyoAdhocWitness', () => {
  describe('observe', () => {
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.debug' }).build()
    const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema: 'network.xyo.schema.target' }
    const params: XyoModuleParams<XyoAdhocWitnessConfig> = { config }
    describe('with no payload supplied to observe', () => {
      it('uses targetSchema', async () => {
        const witness = await XyoAdhocWitness.create(params)
        const observation = await witness.observe()
        expect(observation?.[0]?.schema).toBe(config.targetSchema)
      })
    })
    describe('with payload supplied to observe', () => {
      it('uses payload schema', async () => {
        const observed = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
        const witness = await XyoAdhocWitness.create(params)
        const observation = await witness.observe([observed])
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
    })
  })
})
