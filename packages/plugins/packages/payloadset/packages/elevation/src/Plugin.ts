import { ElevationSchema } from '@xyo-network/elevation-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { ElevationWitness, ElevationWitnessConfig } from './Witness'

export const ElevationPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<ElevationWitnessConfig>>>(
    { required: { [ElevationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await ElevationWitness.create(params)
        return result
      },
    },
  )
