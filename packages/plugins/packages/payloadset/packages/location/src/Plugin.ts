import { LocationSchema } from '@xyo-network/location-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CurrentLocationWitness } from './CurrentLocationWitness'

export const LocationPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<CurrentLocationWitness>>(
    { required: { [LocationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await CurrentLocationWitness.create(params)
      },
    },
  )
