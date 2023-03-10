import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { IdWitness } from './Witness'

export const IdPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<IdWitness>>(
    { required: { [IdSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await IdWitness.create(params)
        return result
      },
    },
  )
