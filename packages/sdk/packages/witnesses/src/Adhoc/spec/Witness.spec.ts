/* eslint-disable import/no-deprecated */
import { Account } from '@xyo-network/account'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { AdhocWitness, AdhocWitnessConfig, AdhocWitnessConfigSchema } from '../Witness'

describe('AdhocWitness', () => {
  describe('observe', () => {
    describe('with payload supplied to observe', () => {
      it('uses payload schema', async () => {
        const payload = await new PayloadBuilder({ schema: 'network.xyo.debug' }).build()
        const config: AdhocWitnessConfig = { name: 'AdhocWitness', payload, schema: AdhocWitnessConfigSchema }
        const observed = await new PayloadBuilder({ schema: 'network.xyo.test' }).build()
        const witness = await AdhocWitness.create({ account: Account.randomSync(), config })
        const observation = await witness.observe([observed])
        expect(observation).toBeArrayOfSize(2)
        expect(observation?.[0]?.schema).toBe(payload.schema)
        expect(observation?.[1]?.schema).toBe(observed.schema)
      })
      it('manifest [direct]', async () => {
        const payload = await new PayloadBuilder({ schema: 'network.xyo.debug' }).build()
        const config: AdhocWitnessConfig = { name: 'AdhocWitness', payload, schema: AdhocWitnessConfigSchema }
        const witness = await AdhocWitness.create({ account: Account.randomSync(), config })
        const manifest = await witness.manifest()
        expect(manifest).toBeDefined()
        expect(manifest.config.schema).toBe(AdhocWitnessConfigSchema)
        expect(manifest.config.name).toBe('AdhocWitness')
      })
      it('manifest [indirect]', async () => {
        const payload = await new PayloadBuilder({ schema: 'network.xyo.debug' }).build()
        const config: AdhocWitnessConfig = { name: 'AdhocWitness', payload, schema: AdhocWitnessConfigSchema }
        const witness = await AdhocWitness.create({ account: Account.randomSync(), config })
        const wrapper = ModuleWrapper.wrap(witness, Account.randomSync())
        const manifest = await wrapper.manifest()
        expect(manifest).toBeDefined()
        expect(manifest.config.schema).toBe(AdhocWitnessConfigSchema)
        expect(manifest.config.name).toBe('AdhocWitness')
      })
    })
  })
})
