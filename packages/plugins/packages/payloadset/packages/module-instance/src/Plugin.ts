import { ModuleParams } from '@xyo-network/module'
import { AbstractModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { AbstractModuleInstanceWitness, AbstractModuleInstanceWitnessConfig } from './Witness'

export const AbstractModuleInstancePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<AbstractModuleInstanceWitnessConfig>>>(
    { required: { [AbstractModuleInstanceSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await AbstractModuleInstanceWitness.create(params)
        return result
      },
    },
  )
