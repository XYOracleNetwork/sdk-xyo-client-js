import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CurrentLocationWitness, CurrentLocationWitnessConfig } from './CurrentLocationWitness'
import { LocationSchema } from './GeographicCoordinateSystemLocationSchema'

export const LocationPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<CurrentLocationWitnessConfig>>>(
    { required: { [LocationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CurrentLocationWitness.create(params)
        return result
      },
    },
  )
