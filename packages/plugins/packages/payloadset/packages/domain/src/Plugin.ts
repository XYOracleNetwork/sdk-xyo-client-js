import { XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoDomainWitness } from './Witness'

export const DomainPlugin = () =>
  createPayloadSetWitnessPlugin<XyoDomainWitness>(
    { required: { [XyoDomainSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoDomainWitness.create(params)
        return result
      },
    },
  )
