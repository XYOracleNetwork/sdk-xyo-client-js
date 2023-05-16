import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { UrlWitness } from './Witness/Witness'

export const UrlPlugin = () =>
  createPayloadSetWitnessPlugin<UrlWitness>(
    { required: { [UrlSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await UrlWitness.create(params)
        return result
      },
    },
  )
