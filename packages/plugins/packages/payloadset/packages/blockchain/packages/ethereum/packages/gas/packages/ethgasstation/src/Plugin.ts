import { XyoEthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthgasstationWitness } from './Witness'

export const XyoEthereumGasEthgasstationPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin>(
    { required: { [XyoEthereumGasEthgasstationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await XyoEthereumGasEthgasstationWitness.create(params)
      },
    },
  )
