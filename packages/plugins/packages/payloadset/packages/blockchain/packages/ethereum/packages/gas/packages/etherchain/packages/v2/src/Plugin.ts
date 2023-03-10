import { XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

export const XyoEthereumGasEtherchainV2Plugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoEtherchainEthereumGasWitnessV2>>(
    { required: { [XyoEthereumGasEtherchainV2Schema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await XyoEtherchainEthereumGasWitnessV2.create(params)) as XyoEtherchainEthereumGasWitnessV2
      },
    },
  )
