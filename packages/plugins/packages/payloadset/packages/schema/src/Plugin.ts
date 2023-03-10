import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { XyoSchemaWitness } from './Witness'

export const XyoSchemaPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoSchemaWitness>>(
    { required: { [XyoSchemaSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoSchemaWitness.create(params)
        return result
      },
    },
  )
