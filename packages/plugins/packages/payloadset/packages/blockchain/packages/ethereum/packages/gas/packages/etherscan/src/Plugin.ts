import { XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherscanWitness } from './Witness'

export const XyoEthereumGasEtherscanPlugin = () =>
  createPayloadSetWitnessPlugin(
    { required: { [XyoEthereumGasEtherscanSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEthereumGasEtherscanWitness.create(params)
        return result as XyoEthereumGasEtherscanWitness
      },
    },
  )
