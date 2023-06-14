import { EthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { EthereumGasEtherscanWitness } from './Witness'

export const EthereumGasEtherscanPlugin = () =>
  createPayloadSetWitnessPlugin<EthereumGasEtherscanWitness>(
    { required: { [EthereumGasEtherscanSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await EthereumGasEtherscanWitness.create(params)
        return result as EthereumGasEtherscanWitness
      },
    },
  )
