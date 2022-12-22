import { IdSchema } from '@xyo-network/id-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { IdWitness, IdWitnessConfig } from './Witness'

export const IdPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<IdWitnessConfig>>>(
    { required: { [IdSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await IdWitness.create(params)
        return result
      },
    },
  )
