import { LocationCertaintySchema } from '@xyo-network/location-certainty-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { LocationCertaintyDiviner, LocationCertaintyDivinerConfig } from './Diviner'

export const LocationCertaintyPlugin = () =>
  createPayloadSetPlugin<PayloadSetDivinerPlugin<XyoModuleParams<LocationCertaintyDivinerConfig>>>(
    { required: { [LocationCertaintySchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return await LocationCertaintyDiviner.create(params)
      },
    },
  )
