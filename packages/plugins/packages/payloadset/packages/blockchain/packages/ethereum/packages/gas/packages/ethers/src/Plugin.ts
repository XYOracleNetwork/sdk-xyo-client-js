import { XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthersWitness } from './Witness'

export const XyoEthereumGasEthersPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoEthereumGasEthersWitness>>(
    { required: { [XyoEthereumGasEthersSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await XyoEthereumGasEthersWitness.create(params)) as XyoEthereumGasEthersWitness
      },
    },
  )
