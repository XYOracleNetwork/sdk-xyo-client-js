import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { UrlSafetySchema } from '@xyo-network/url-safety-payload-plugin'

import { UrlSafetyWitness } from './Witness'

export const UrlSafetyPlugin = () =>
  createPayloadSetWitnessPlugin<UrlSafetyWitness>(
    { required: { [UrlSafetySchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await UrlSafetyWitness.create(params)
        return result
      },
    },
  )
