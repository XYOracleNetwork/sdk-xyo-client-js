import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationWitness, XyoLocationElevationWitnessConfig } from './Witness'

export const XyoLocationElevationPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoLocationElevationWitnessConfig>>>(
    { required: { [XyoLocationElevationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoLocationElevationWitness.create(params)
        return result
      },
    },
  )
