import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { XyoPentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'

import { XyoPentairScreenlogicWitness } from './Witness'

export const XyoPentairScreenlogicPlugin = () =>
  createPayloadSetWitnessPlugin<XyoPentairScreenlogicWitness>(
    { required: { [XyoPentairScreenlogicSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoPentairScreenlogicWitness.create(params)
        return result
      },
    },
  )
