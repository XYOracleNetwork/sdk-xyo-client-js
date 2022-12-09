import { XyoModuleParams } from '@xyo-network/module'
import { XyoNodeSystemInfoSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoNodeSystemInfoWitnessConfig } from './Config'
import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoNodeSystemInfoWitnessConfig>>>(
    { required: { [XyoNodeSystemInfoSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoNodeSystemInfoWitness.create(params)
        return result
      },
    },
  )
