import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { XyoSchemaWitness } from './Witness'

export const XyoSchemaPlugin = () =>
  createPayloadSetWitnessPlugin<XyoSchemaWitness>(
    { required: { [XyoSchemaSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoSchemaWitness.create(params)
        return result
      },
    },
  )
