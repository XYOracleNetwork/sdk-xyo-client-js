import { NodeSystemInfoSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { NodeSystemInfoWitness } from './Witness'

export const NodeSystemInfoPlugin = () =>
  createPayloadSetWitnessPlugin<NodeSystemInfoWitness>(
    { required: { [NodeSystemInfoSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await NodeSystemInfoWitness.create(params)
        return result
      },
    },
  )
