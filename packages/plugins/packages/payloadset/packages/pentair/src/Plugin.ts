import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { PentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'

import { PentairScreenlogicWitness } from './Witness'

export const PentairScreenlogicPlugin = () =>
  createPayloadSetWitnessPlugin<PentairScreenlogicWitness>(
    { required: { [PentairScreenlogicSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await PentairScreenlogicWitness.create(params)
        return result
      },
    },
  )
