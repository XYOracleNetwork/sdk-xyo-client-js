import { XyoModuleParams } from '@xyo-network/module'
import { XyoModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfig } from './Witness'

export const XyoModuleInstancePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoModuleInstanceWitnessConfig>>>(
    { required: { [XyoModuleInstanceSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoModuleInstanceWitness.create(params)
        return result
      },
    },
  )
