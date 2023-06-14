import { EthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { EthereumGasEthersWitness } from './Witness'

export const EthereumGasEthersPlugin = () =>
  createPayloadSetWitnessPlugin<EthereumGasEthersWitness>(
    { required: { [EthereumGasEthersSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await EthereumGasEthersWitness.create(params)
      },
    },
  )
