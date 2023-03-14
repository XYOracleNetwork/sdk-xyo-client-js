import { XyoNodeSystemInfoSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPlugin = () =>
  createPayloadSetWitnessPlugin<XyoNodeSystemInfoWitness>(
    { required: { [XyoNodeSystemInfoSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoNodeSystemInfoWitness.create(params)
        return result
      },
    },
  )
