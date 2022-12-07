import { IdSchema } from '@xyo-network/id-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { IdWitness, IdWitnessConfig } from './Witness'

export const IdPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<IdWitnessConfig>>>(
    { required: { [IdSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await IdWitness.create(params)
        return result
      },
    },
  )
