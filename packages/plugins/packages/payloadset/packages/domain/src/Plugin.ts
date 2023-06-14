import { DomainSchema } from '@xyo-network/domain-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { DomainWitness } from './Witness'

export const DomainPlugin = () =>
  createPayloadSetWitnessPlugin<DomainWitness>(
    { required: { [DomainSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await DomainWitness.create(params)
        return result
      },
    },
  )
