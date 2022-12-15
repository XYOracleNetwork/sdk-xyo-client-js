import { XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

export const XyoEthereumGasEtherchainV2Plugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoEthereumGasEtherchainV2WitnessConfig>>>(
    { required: { [XyoEthereumGasEtherchainV2Schema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEtherchainEthereumGasWitnessV2.create(params)
        return result
      },
    },
  )
