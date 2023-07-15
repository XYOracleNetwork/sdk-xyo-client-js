import { HDWallet } from '@xyo-network/account'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { AdhocWitness, AdhocWitnessConfig, AdhocWitnessConfigSchema } from '../Witness'

describe('AdhocWitness', () => {
  describe('observe', () => {
    const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).build()
    const config: AdhocWitnessConfig = { name: 'AdhocWitness', payload, schema: AdhocWitnessConfigSchema }
    describe('with payload supplied to observe', () => {
      const observed = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
      it('uses payload schema', async () => {
        const witness = await AdhocWitness.create({ account: await HDWallet.random(), config })
        const observation = await witness.observe([observed])
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
      it('uses payload schema with WitnessWrapper', async () => {
        const witness = await AdhocWitness.create({ account: await HDWallet.random(), config })
        const observation = await witness.observe([observed])
        expect(observation).toBeArrayOfSize(1)
        expect(observation?.[0]?.schema).toBe(observed.schema)
      })
      it('manifest [direct]', async () => {
        const witness = await AdhocWitness.create({ account: await HDWallet.random(), config })
        const manifest = await witness.manifest()
        expect(manifest).toBeDefined()
        expect(manifest.config.schema).toBe(AdhocWitnessConfigSchema)
        expect(manifest.config.name).toBe('AdhocWitness')
      })
      it('manifest [indirect]', async () => {
        const witness = await AdhocWitness.create({ account: await HDWallet.random(), config })
        const wrapper = ModuleWrapper.wrap(witness, await HDWallet.random())
        const manifest = await wrapper.manifest()
        expect(manifest).toBeDefined()
        expect(manifest.config.schema).toBe(AdhocWitnessConfigSchema)
        expect(manifest.config.name).toBe('AdhocWitness')
      })
    })
  })
})
