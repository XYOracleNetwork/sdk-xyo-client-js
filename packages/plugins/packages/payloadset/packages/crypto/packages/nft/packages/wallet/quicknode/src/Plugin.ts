import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { ApiGraphqlWitness, GraphqlQuerySchema } from './Witness'

export const ApiGraphqlWitnessPlugin = () =>
  createPayloadSetWitnessPlugin<ApiGraphqlWitness>(
    { required: { [GraphqlQuerySchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await ApiGraphqlWitness.create(params)
      },
    },
  )
