import { XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoDomainWitnessConfig } from './Config'
import { XyoDomainWitness } from './Witness'

export const DomainPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoDomainWitnessConfig>>>(
    { required: { [XyoDomainSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoDomainWitness.create(params)
        return result
      },
    },
  )
