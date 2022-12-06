import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfig } from './Witness'

export const XyoIdPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoIdWitnessConfig>>>(
    { required: { [XyoIdSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoIdWitness.create(params)
        return result
      },
    },
  )
