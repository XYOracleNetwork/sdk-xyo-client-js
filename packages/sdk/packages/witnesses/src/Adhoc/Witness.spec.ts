import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoAdhocWitness, XyoAdhocWitnessConfig, XyoAdhocWitnessConfigSchema } from './Witness'

describe('XyoAdhocWitness', () => {
  describe('targetSchema', () => {
    it('with no config supplied uses default', async () => {
      const payload = new XyoPayloadBuilder({ schema: 'network.xyo.debug' }).build()
      const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema: 'network.xyo.debug' }
      const witness = await XyoAdhocWitness.create({ config })
      const observation = await witness.observe([payload])
      expect(observation?.[0]?.schema).toBe(payload.schema)
    })
    it('with targetSchema supplied uses targetSchema', async () => {
      const payload = new XyoPayloadBuilder({ schema: 'network.xyo.debug' }).build()
      const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema: 'network.xyo.test' }
      const params: XyoModuleParams<XyoAdhocWitnessConfig> = { config }
      const witness = await XyoAdhocWitness.create(params)
      const observation = await witness.observe([payload])
      expect(observation?.[0]?.schema).toBe(payload.schema)
    })
  })
  describe('observe', () => {
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.debug' }).build()
    const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema: 'network.xyo.debug' }
    describe('with no payload supplied in config', () => {
      it('with payload supplied to observe observes payload schema', async () => {
        const witness = await XyoAdhocWitness.create({ config })
        const observation = await witness.observe([payload])
        expect(observation?.[0]?.schema).toBe(payload.schema)
      })
      it.skip('with empty array supplied to observe brings down Jest', async () => {
        const witness = await XyoAdhocWitness.create({ config })
        expect(async () => await witness.observe([])).toThrowError()
      })
      it('with no payload supplied to observe observes undefined schema', async () => {
        const witness = await XyoAdhocWitness.create({ config })
        const observation = await witness.observe()
        expect(observation?.[0]?.schema).toBe(undefined)
      })
    })
    describe('with payload supplied in config', () => {
      it('with no payload supplied to observe uses targetSchema', async () => {
        const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema: 'network.xyo.schema.target' }
        const params: XyoModuleParams<XyoAdhocWitnessConfig> = { config }
        const witness = await XyoAdhocWitness.create(params)
        const observation = await witness.observe()
        expect(observation?.[0]?.schema).toBe(config.targetSchema)
      })
      it('with payload supplied to observe uses payload schema', async () => {
        const observed = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
        const config: XyoAdhocWitnessConfig = { payload, schema: XyoAdhocWitnessConfigSchema, targetSchema: 'network.xyo.schema.target' }
        const params: XyoModuleParams<XyoAdhocWitnessConfig> = { config }
        const witness = await XyoAdhocWitness.create(params)
        const observation = await witness.observe([observed])
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
    })
  })
})
