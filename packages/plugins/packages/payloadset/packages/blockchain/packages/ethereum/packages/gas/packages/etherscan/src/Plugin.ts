import { XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { XyoEthereumGasEtherscanWitness } from './Witness'

export const XyoEthereumGasEtherscanPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoEthereumGasEtherscanWitnessConfig>>>(
    { required: { [XyoEthereumGasEtherscanSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEthereumGasEtherscanWitness.create(params)
        return result
      },
    },
  )
