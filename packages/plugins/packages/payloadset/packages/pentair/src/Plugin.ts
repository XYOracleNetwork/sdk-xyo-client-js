import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { XyoPentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'

import { XyoPentairScreenlogicWitness, XyoPentairScreenlogicWitnessConfig } from './Witness'

export const XyoPentairScreenlogicPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoPentairScreenlogicWitnessConfig>>>(
    { required: { [XyoPentairScreenlogicSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoPentairScreenlogicWitness.create(params)
        return result
      },
    },
  )
