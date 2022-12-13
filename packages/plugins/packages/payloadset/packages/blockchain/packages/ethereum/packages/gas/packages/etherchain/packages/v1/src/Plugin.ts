import { XyoEthereumGasEtherchainV1Schema } from '@xyo-network/etherchain-ethereum-gas-v1-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

export const XyoEthereumGasEtherchainV1Plugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoEthereumGasEtherchainV1WitnessConfig>>>(
    { required: { [XyoEthereumGasEtherchainV1Schema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEtherchainEthereumGasWitnessV1.create(params)
        return result
      },
    },
  )
