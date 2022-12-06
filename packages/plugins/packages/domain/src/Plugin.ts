import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoDomainWitnessConfig } from './Config'
import { XyoDomainSchema } from './Schema'
import { XyoDomainWitness } from './Witness'

export const XyoDomainPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoDomainWitnessConfig>>>(
    { required: { [XyoDomainSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoDomainWitness.create(params)
        return result
      },
    },
  )
