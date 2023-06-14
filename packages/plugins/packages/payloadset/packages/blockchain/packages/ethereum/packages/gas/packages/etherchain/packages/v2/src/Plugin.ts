import { EthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { EtherchainEthereumGasWitnessV2 } from './Witness'

export const EthereumGasEtherchainV2Plugin = () =>
  createPayloadSetWitnessPlugin(
    { required: { [EthereumGasEtherchainV2Schema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await EtherchainEthereumGasWitnessV2.create(params)) as EtherchainEthereumGasWitnessV2
      },
    },
  )
