import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { SchemaSchema } from '@xyo-network/schema-payload-plugin'

import { SchemaWitness } from './Witness'

export const SchemaPlugin = () =>
  createPayloadSetWitnessPlugin<SchemaWitness>(
    { required: { [SchemaSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await SchemaWitness.create(params)
        return result
      },
    },
  )
