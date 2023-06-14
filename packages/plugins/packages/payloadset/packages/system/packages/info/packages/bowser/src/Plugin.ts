import { BowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { BowserSystemInfoWitness } from './Witness'

export const BowserSystemInfoPlugin = () =>
  createPayloadSetWitnessPlugin<BowserSystemInfoWitness>(
    { required: { [BowserSystemInfoSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await BowserSystemInfoWitness.create(params)
      },
    },
  )
