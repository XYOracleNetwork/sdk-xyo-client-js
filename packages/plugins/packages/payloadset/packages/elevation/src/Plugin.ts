import { ElevationSchema } from '@xyo-network/elevation-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { ElevationWitness } from './Witness'

export const ElevationPlugin = () =>
  createPayloadSetWitnessPlugin<ElevationWitness>(
    { required: { [ElevationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await ElevationWitness.create(params)
        return result
      },
    },
  )
