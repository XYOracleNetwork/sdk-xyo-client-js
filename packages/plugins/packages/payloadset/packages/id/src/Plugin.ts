import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { IdWitness } from './Witness'

export const IdPlugin = () =>
  createPayloadSetWitnessPlugin<IdWitness>(
    { required: { [IdSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await IdWitness.create(params)
        return result
      },
    },
  )
