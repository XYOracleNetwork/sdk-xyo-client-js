import { LocationCertaintySchema } from '@xyo-network/location-certainty-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { LocationCertaintyDiviner, LocationCertaintyDivinerConfig } from './Diviner'

export const LocationCertaintyPlugin = () =>
  createPayloadSetPlugin<PayloadSetDivinerPlugin<ModuleParams<LocationCertaintyDivinerConfig>>>(
    { required: { [LocationCertaintySchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return await LocationCertaintyDiviner.create(params)
      },
    },
  )
