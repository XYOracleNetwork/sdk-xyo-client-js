import { XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthersWitness } from './Witness'

export const XyoEthereumGasEthersPlugin = () =>
  createPayloadSetWitnessPlugin<XyoEthereumGasEthersWitness>(
    { required: { [XyoEthereumGasEthersSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await XyoEthereumGasEthersWitness.create(params)) as XyoEthereumGasEthersWitness
      },
    },
  )
