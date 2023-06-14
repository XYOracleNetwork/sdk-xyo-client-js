import { EthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { EthereumGasEthgasstationWitness } from './Witness'

export const EthereumGasEthgasstationPlugin = () =>
  createPayloadSetWitnessPlugin<EthereumGasEthgasstationWitness>(
    { required: { [EthereumGasEthgasstationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await EthereumGasEthgasstationWitness.create(params)) as EthereumGasEthgasstationWitness
      },
    },
  )
