import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthersSchema } from './Schema'
import { XyoEthereumGasEthersWitness, XyoEthereumGasEthersWitnessParams } from './Witness'

export const XyoEthereumGasEthersPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoEthereumGasEthersWitnessParams>>(
    { required: { [XyoEthereumGasEthersSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEthereumGasEthersWitness.create(params)
        return result
      },
    },
  )
