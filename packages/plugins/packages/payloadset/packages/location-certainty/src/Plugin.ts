import { LocationCertaintySchema } from '@xyo-network/location-certainty-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { LocationCertaintyDiviner } from './Diviner'

export const LocationCertaintyPlugin = () =>
  createPayloadSetPlugin<PayloadSetDivinerPlugin<LocationCertaintyDiviner>>(
    { required: { [LocationCertaintySchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return await LocationCertaintyDiviner.create(params)
      },
    },
  )
