import { XyoBowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoBowserSystemInfoWitness } from './Witness'

export const XyoBowserSystemInfoPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoBowserSystemInfoWitness>>(
    { required: { [XyoBowserSystemInfoSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await XyoBowserSystemInfoWitness.create(params)
      },
    },
  )
