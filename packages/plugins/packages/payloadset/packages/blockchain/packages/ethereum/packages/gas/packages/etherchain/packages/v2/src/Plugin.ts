import { XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

export const XyoEthereumGasEtherchainV2Plugin = () =>
  createPayloadSetWitnessPlugin(
    { required: { [XyoEthereumGasEtherchainV2Schema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await XyoEtherchainEthereumGasWitnessV2.create(params)) as XyoEtherchainEthereumGasWitnessV2
      },
    },
  )
